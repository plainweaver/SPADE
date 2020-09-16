"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _chai = require("chai");

var _levelup = _interopRequireDefault(require("levelup"));

var _rocksdb = _interopRequireDefault(require("rocksdb"));

var _levelgraph = _interopRequireDefault(require("levelgraph"));

var _levelSecondIndex = _interopRequireDefault(require("../level-second-index"));

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOCATION_CELLS = './storage/test/level-subset/cells';
const LOCATION_RELATIONS = './storage/test/level-subset/relations';

_fs.default.mkdirSync(LOCATION_CELLS, {
  recursive: true
});

_fs.default.mkdirSync(LOCATION_RELATIONS, {
  recursive: true
});

const dbForCells = (0, _levelup.default)((0, _rocksdb.default)(LOCATION_CELLS));
const dbForRelations = (0, _levelup.default)((0, _rocksdb.default)(LOCATION_RELATIONS));
let counter = 0;
const storage = (0, _index.default)((0, _levelSecondIndex.default)(dbForCells, {
  primaryIndex: 'id'
}), (0, _levelgraph.default)(dbForRelations), function generateId(callback) {
  counter += 1;
  if (callback) callback(null, counter);
  return counter;
});
after(() => {
  return Promise.all([dbForCells.close(), dbForRelations.close()]).then(() => {
    _fs.default.rmdirSync(LOCATION_CELLS, {
      recursive: true
    });

    _fs.default.rmdirSync(LOCATION_RELATIONS, {
      recursive: true
    });
  });
});
describe('createSet(cellObject, callback)', () => {
  it('throws when cellObject does not have name property.', () => {
    return storage.createSet({}).catch(err => {
      _chai.assert.instanceOf(err, Error);
    });
  });
  it('should return id, which is generated for a set.', () => {
    return storage.createSet({
      name: 'A'
    }).then(id => {
      _chai.assert.exists(id);
    });
  });
});
describe('intergration', () => {
  it('createSet -> getSetById', () => {
    let generatedId;
    return storage.createSet({
      name: 'A'
    }).then(id => {
      generatedId = id;
      return storage.getSetById(id);
    }).then(set => {
      _chai.assert.deepEqual(set, {
        id: generatedId,
        name: 'A'
      });
    });
  });
  it('createSet -> updateSet -> getSetById', () => {
    let generatedId;
    return storage.createSet({
      name: 'A'
    }).then(id => {
      generatedId = id;
      return storage.updateSet(id, {
        name: 'B'
      });
    }).then(() => {
      return storage.getSetById(generatedId);
    }).then(set => {
      _chai.assert.deepEqual(set, {
        id: generatedId,
        name: 'B'
      });
    });
  });
  it('deleteSetById() throws if it has subset', async () => {
    let err;

    try {
      const id = await storage.createSet({
        name: 'A'
      });
      await storage.createSetInSet({
        name: 'B'
      }, id);
      await storage.deleteSet(id);
    } catch (e) {
      err = e;
    }

    _chai.assert.instanceOf(err, Error);
  });
  it('createSet -> createSetInSet -> deleteSet -> no cell and any relation', async () => {
    const id1 = await storage.createSet({
      name: 'A'
    });
    const id2 = await storage.createSetInSet({
      name: 'B'
    }, id1);
    await storage.deleteSet(id2);
    const subsets = await storage.getSubsetIds(id1);
    let id;

    try {
      id = await storage.getSetById(id2);
    } catch (e) {
      if (e.name !== 'NotFoundError') throw e;
    }

    _chai.assert.isEmpty(subsets);

    _chai.assert.isUndefined(id);
  });
});
describe('subsets', () => {
  const ids = {};
  before(async () => {
    /*
          parent
       ┌────┴────┐
    child1     child2
       └────┬────┘
        grandchild
     */
    ids.parent = await storage.createSet({
      name: 'parent'
    });
    ids.child1 = await storage.createSetInSet({
      name: 'child_1'
    }, ids.parent);
    ids.child2 = await storage.createSetInSet({
      name: 'child_2'
    }, ids.parent);
    ids.grandchild = await storage.createSet({
      name: 'grand_child'
    });
    await storage.putSetInSet(ids.grandchild, ids.child1);
    await storage.putSetInSet(ids.grandchild, ids.child2);
  });
  it('getSubsetCells(mainSetId, callback)', () => {
    return storage.getSubsetCells(ids.parent).then(result => {
      _chai.assert.includeDeepMembers(result, [{
        id: ids.child1,
        name: 'child_1'
      }, {
        id: ids.child2,
        name: 'child_2'
      }]);
    });
  });
  it('getSubsetIds(mainSetId, callback)', () => {
    return storage.getSubsetIds(ids.parent).then(result => {
      _chai.assert.includeMembers(result, [ids.child1, ids.child2]);
    });
  });
  it('getSubsetsRecursively(biggestSetId, callback)', () => {
    return storage.getSubsetIdsRecursively(ids.parent).then(result => {
      _chai.assert.includeMembers(result, [ids.child1, ids.child2, ids.grandchild]);
    });
  });
  it('getSubsetsRecursively(biggestSetId, callback)', () => {
    return storage.getSubsetCellsRecursively(ids.parent).then(result => {
      _chai.assert.exists(result[0].id);

      _chai.assert.exists(result[1].id);

      _chai.assert.exists(result[2].id);
    });
  });
  it('getSupersetIds(setId)', () => {
    return storage.getSupersetIds(ids.grandchild).then(result => {
      _chai.assert.includeMembers(result, [ids.child1, ids.child2]);
    });
  });
  it('getSupersetIdsRecursively(setId)', () => {
    return storage.getSupersetIdsRecursively(ids.grandchild).then(result => {
      _chai.assert.includeMembers(result, [ids.child1, ids.child2, ids.parent]);
    });
  });
  it('isSubsetOfSet(setId, biggerSetId)', () => {
    return storage.isSubsetOfSet(ids.grandchild, ids.parent).then(result => {
      _chai.assert.equal(result, true);
    });
  });
});
describe('meaningless relation', () => {
  it('throws if meaningless shortcut is going to be created', async () => {
    const id1 = await storage.createSet({
      name: 'A'
    });
    const id2 = await storage.createSetInSet({
      name: 'B'
    }, id1);
    const id3 = await storage.createSetInSet({
      name: 'C'
    }, id2);

    try {
      await storage.putSetInSet(id3, id1);
    } catch (e) {
      _chai.assert.include(e.message, 'Meaningless shortcut');
    }
  });
});
describe('circular set', () => {
  it('throws if circular set is going to be created', async () => {
    const id1 = await storage.createSet({
      name: 'A'
    });
    const id2 = await storage.createSetInSet({
      name: 'B'
    }, id1);

    try {
      await storage.putSetInSet(id1, id2);
    } catch (e) {
      _chai.assert.include(e.message, 'Circular set');
    }
  });
});
describe('multiple parents', () => {
  const ids = {};
  before(async () => {
    /*
     parent1     parent2
        └─────┬────┘
            child
              │
          grandchild
    */
    ids.parent1 = await storage.createSet({
      name: 'parent1'
    });
    ids.parent2 = await storage.createSet({
      name: 'parent2'
    });
    ids.child = await storage.createSet({
      name: 'child'
    });
    await storage.putSetInSet(ids.child, ids.parent1);
    await storage.putSetInSet(ids.child, ids.parent2);
    ids.grandchild = await storage.createSetInSet({
      name: 'grand_child'
    }, ids.child);
  });
});
//# sourceMappingURL=index.test.js.map