// storage.putObject(object, callback)
// storage.getObjectsByIndex(propertyKeyString, value) returns array of items

import _ from 'lodash';
import Promise from 'bluebird';
import sublevel from 'subleveldown';
import concat from 'level-concat-iterator';
import { appendCallback, returnPromise } from '../versatile-function';
import autoinc from '../level-auto-inc';
import Prefix from '../level-prefixer';
import fixedkey from '../level-fixed-key';
import IdGenerator from './IdGenerator';

// for keys of IndexStore
const prefix = Prefix('!');

/**
 * When putting, each key of given object will be treated as an index.
 * @param db abstract-leveldown compatible store.
 * @param options delRecursive: Boolean, primaryIndex: String
 */
function LevelIndex(db, options = {}) {
  if (!(this instanceof LevelIndex)) {
    return new LevelIndex(db, options);
  }

  this.store = {};
  // stores object consists of keys locating parts in indexed store
  this.store.main = sublevel(db, 'main', { valueEncoding: 'json' });
  // reverse lookup store. (key: indexName + indexedValue, value: array of id of indexedObject)
  this.store.index = sublevel(db, 'index', { valueEncoding: 'json'});

  this.delRecursive = options.delRecursive;
  this.primaryIndex = options.primaryIndex;
  this.reuseId = options.reuseId || true; // overwrite & insert between order
  this.idGenerator = new IdGenerator(this);
}

LevelIndex.prototype.putIndexedObject = appendCallback(async function(indexedObject) {
  const key = await this.idGenerator(indexedObject);

  // chunk out the object by indices and store them
  const promises = Object.keys(indexedObject).map(index => {
    return (async () => {
      const keyForIndexStore = prefix(index, indexedObject[index]);

      // find objects stored with same index
      let mains;
      try {
        mains = await this.store.index.get(keyForIndexStore);
      } catch (e) {
        if (e.name !== 'NotFoundError') throw e;
        else mains = [];
      }

      // put new ids array to reverse lookup store.
      mains.push(key);
      await this.store.index.put(keyForIndexStore, mains);
    })();
  });

  await Promise.all(promises);
  await this.store.main.put(key, indexedObject);
  return key;
});

// returns all of indexedObject
LevelIndex.prototype.getAll = returnPromise(0, function(callback) {
  concat(this.store.main.iterator(), (err, result) => callback(err, result.map(x => x.value)));
});

LevelIndex.prototype.getByPrimaryValue = appendCallback(async function(indexedValue) {
  const mains = await this.store.index.get(prefix(this.primaryIndex, indexedValue));
  if (mains.length > 1) throw new Error(
    'Multiple values have found with primary index. Unique value must be stored in primary index.'
  );
  return await this.store.main.get(mains[0]);
});

LevelIndex.prototype.getByIndexedValue = appendCallback(async function(indexName, indexedValue) {
  const mains = await this.store.index.get(prefix(indexName, indexedValue));

  return await Promise.all(mains.map(id => this.store.main.get(id)));
});

LevelIndex.prototype.getByQueryObject = appendCallback(async function(queryObject) {
  const mainIds = await Promise.map(Object.keys(queryObject), indexName => {
    return this.store.index.get(prefix(indexName, queryObject[indexName]));
  });

  return await Promise.map(_.intersection(...mainIds), mainId => {
    return this.store.main.get(mainId);
  });
});

LevelIndex.prototype.delByPrimaryValue = appendCallback(async function(indexedValue) {
  const mains = await this.store.index.get(prefix(this.primaryIndex, indexedValue));
  if (mains.length > 1) throw new Error(
    'Multiple values have found with primary index. Unique value must be stored in primary index.'
  );
  await this.store.main.del(mains[0]);
  await this.store.index.del(prefix(this.primaryIndex, indexedValue));
});

LevelIndex.prototype.delByIndexedValue = appendCallback(async function(indexName, indexedValue) {
  // primary keys of objects to be removed
  const mains = await this.store.index.get(prefix(indexName, indexedValue));
  if (!mains)
    throw new Error("[level-second-index] No indexedObjects found with given value.");
  if (mains.length > 1 && !this.delRecursive)
    throw new Error("[level-second-index] Cannot delete multiple indexedObject at once because option 'delRecursive' is set to false.");

  // deletes every indexedObjects
  Promise.each(mains, async mainPK => {
    // deletes one indexedObject
    const indexedObject = await this.store.main.get(mainPK);
    await Promise.each(Object.keys(indexedObject), async indexName => {
      // deletes from reverse index lookup store
      const keyForIndexStore = prefix(indexName, indexedObject[indexName]);
      const mains = await this.store.index.get(keyForIndexStore);
      const newMains = mains.splice(mains.indexOf(mainPK), 1);
      await this.store.index.del(keyForIndexStore);
      await this.store.index.put(keyForIndexStore, newMains);
    });
    await this.store.main.del(mainPK);
  });

  return mains;
});

LevelIndex.prototype.delByQueryObject = appendCallback(async function(queryObject) {
  const mainIds = await Promise.map(Object.keys(queryObject), indexName => {
    return this.store.index.get(prefix(indexName, queryObject[indexName]));
  });

  return await Promise.map(_.intersection(...mainIds), mainId => {
    return this.store.main.del(mainId);
  });
});

// -- experimental methods --

LevelIndex.prototype._getAllObjects = function() {};

LevelIndex.prototype._getAllIndices = function() {};

export default LevelIndex;
