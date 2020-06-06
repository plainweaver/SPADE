// name with adjective (part of bigger part) (sum after)
// name without adjective
//  - outside of any adjectives but within the set.

// get all data
// get all data, only in subsets
// get all data, outside of subsets

// todo) Same name, but different id.
import { returnPromise, appendCallback } from '../versatile-function';

function LevelSubset(setcelldb, relationdb, generateId) {
  if (!(this instanceof LevelSubset)) {
    return new LevelSubset(setcelldb, relationdb, generateId);
  }

  if (!generateId) throw new Error('level-subset requires id generator.');
  if (setcelldb.primaryIndex !== 'id') throw new Error(`level-subset requires setcelldb with a primaryIndex 'id'.`);

  this.setcelldb = setcelldb; // level-object with index [ id, name, ?dscr, ?tags ... ("?" means to be supported) ]
  this.relationdb = relationdb;
  this.generateId = async function (callback) { // to make sure it supports both callback and promise
    return await generateId(callback);
  };
}

LevelSubset.prototype.createSet = appendCallback(async function(cell) {
  const id = await this.generateId();

  await Promise.all([
    this.setcelldb.putIndexedObject({ id: id, ...cell }),
    this.relationdb.put({ subject: id }),
  ]);

  return id;
});

LevelSubset.prototype.updateSet = appendCallback(async function(setId, cellInfo) {
  await this.setcelldb.delByPrimaryValue(setId);
  await this.setcelldb.putIndexedObject({ id: setId, ...cellInfo });
});

LevelSubset.prototype.deleteSet = appendCallback(async function(setId, failIfSupersetExist = false) {
  const subsets = await this.getSubsetIds(setId);

  if (subsets.length) throw new Error('Cannot delete set which has subsets under itself.');

  const supersets = await this.getSupersetCells(setId);

  if (supersets.length) {
    if (failIfSupersetExist) {
      throw new Error("Cannot delete a set which is linked to superset set. 'failIfSupersetsExist' should be not true to forcefully remove all supersets.");
    }

    // TODO) ensure there's no double deletion or skip to delete
    await Promise.all(supersets.reverse().map(triple => {
      return new Promise((res, rej) => {
        this.relationdb.del(triple, (err) => err ? rej(err) : res())
      });
    }));
  }

  await this.setcelldb.delByPrimaryValue(setId);
});

LevelSubset.prototype.getSetById = returnPromise(1, function(id, callback) {
  return this.setcelldb.getByPrimaryValue(id, callback);
});

LevelSubset.prototype.getSetIdsByName = returnPromise(1, function(name, callback) {
  return this.setcelldb.getObjectIdsByIndex('name', name, callback);
});

// -- Getters --

LevelSubset.prototype.getSubsetIds = returnPromise(1, function(mainsetId, callback) {
  this.relationdb.get({ predicate: 'isSubsetOf', object: mainsetId }, (err, result) => {
    if (err) return callback(err);
    callback(null, result.map(item => JSON.parse(item.toString()).subject));
  });
});

LevelSubset.prototype.getSubsetCells = appendCallback(async function(mainsetId) {
  const ids = await this.getSubsetIds(mainsetId);
  return await Promise.all(ids.map(id => this.getSetById(id)));
});

LevelSubset.prototype.getSubsetIdsRecursively = appendCallback(async function(biggestSetId) {
  const self = this;
  const result = [];

  async function findSubset(setId) {
    let ids = await self.getSubsetIds(setId);

    // delete sets already gotten. (circularly related ones)
    ids = ids.filter(id => !result.includes(id));

    result.push(...ids);

    await Promise.all(ids.map(id => findSubset(id)));
  }

  await findSubset(biggestSetId);

  return result;
});

LevelSubset.prototype.getSubsetCellsRecursively = appendCallback(async function(biggestSetId) {
  const ids = await this.getSubsetIdsRecursively(biggestSetId);
  return await Promise.all(ids.map(id => this.getSetById(id)));
});

LevelSubset.prototype.getSupersetIds = appendCallback(async function(setId) {
  const supersets = await this.getSupersetCells(setId);
  return supersets.map(triple => triple.object);
});

LevelSubset.prototype.getSupersetCells = returnPromise(1, function(setId, callback) {
  this.relationdb.get({ subject: setId, predicate: 'isSubsetOf' }, (err, list) => {
    if (err && err.name !== 'NotFoundError') return callback(err);
    return callback(null, list.map(set => JSON.parse(set.toString())));
  });
});

LevelSubset.prototype.getSupersetIdsRecursively = appendCallback(async function(setId) {
  const self = this;
  const supersets = [];
  async function getSupersets(target) {
    try {
      let list = await new Promise((res, rej) => self.relationdb.get({ subject: target, predicate: 'isSubsetOf' }, (err, result) => {
        if (err && err.name !== 'NotFoundError') return rej(err);
        return res(result);
      }));

      if (list.length) {
        list = list.map(set => JSON.parse(set.toString()).object).filter(id => !supersets.includes(id));
        supersets.push(...list);
        await Promise.all(list.map(supersetId => getSupersets(supersetId)));
      }
    } catch (e) {
      if (e.name === 'NotFoundError') return undefined;
      else throw e;
    }
  }

  await getSupersets(setId);
  if (supersets.includes(setId)) supersets.splice(supersets.indexOf(setId), 1);
  return supersets;
});

// -- Relations --

LevelSubset.prototype.isSubsetOfSet = appendCallback(async function(subsetId, supersetId) {
  const self = this;
  let found = false;

  async function compare(id) {
    if (found) return;

    if (id === supersetId) {
      return found = true;
    }

    const supersets = await self.getSupersetIds(id);
    await Promise.all(supersets.map(id => compare(id)));
  }

  await compare(subsetId);
  return found;
});

LevelSubset.prototype.createSetInSet = appendCallback(async function(setCell, biggerSetId) {
  const id = await this.createSet(setCell);
  await this.putSetInSet(id, biggerSetId);
  return id;
});

LevelSubset.prototype.putSetInSet = appendCallback(async function(targetSetId, biggerSetId) {
  // if wrapperSet is a superset (recursively) of target -> creating meaningless shortcut
  const isMeaningless = await this.isSubsetOfSet(targetSetId, biggerSetId);
  if (isMeaningless) throw new Error('Meaningless shortcut across sets is not allowed. To modify, remove relations first and construct them again.');

  // if wrapperSet is a subset (recursively) of target -> circular set
  const isCircular = await this.isSubsetOfSet(biggerSetId, targetSetId);
  if (isCircular) throw new Error('Circular set is not allowed.');

  await this.relationdb.put({ subject: targetSetId, predicate: 'isSubsetOf', object: biggerSetId });
});

LevelSubset.prototype.removeSetFromSet = returnPromise(2, function(targetSubsetId, biggerSetId, callback) {
  this.relationdb.del({ subject: targetSubsetId, predicate: 'isSubsetOf', object: biggerSetId }, callback);
});

export default LevelSubset;
