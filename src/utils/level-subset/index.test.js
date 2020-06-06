import fs from 'fs';
import { assert } from 'chai';
import levelup from 'levelup';
import rocksdb from 'rocksdb';
import LevelGraph from 'levelgraph';
import LevelIndex from '../level-second-index';
import LevelSubset from './index';

const LOCATION_CELLS = './storage/test/level-subset/cells';
const LOCATION_RELATIONS = './storage/test/level-subset/relations';

fs.mkdirSync(LOCATION_CELLS, { recursive: true });
fs.mkdirSync(LOCATION_RELATIONS, { recursive: true });

const dbForCells = levelup(rocksdb(LOCATION_CELLS));
const dbForRelations = levelup(rocksdb(LOCATION_RELATIONS));

let counter = 0;

const storage = LevelSubset(
  LevelIndex(dbForCells, { primaryIndex: 'id' }),
  LevelGraph(dbForRelations),
  function generateId(callback) {
    counter += 1;
    if (callback) callback(null, counter);
    return counter;
  });

after(() => {
  return Promise.all([
    dbForCells.close(),
    dbForRelations.close()
  ]).then(() => {
    fs.rmdirSync(LOCATION_CELLS, { recursive: true });
    fs.rmdirSync(LOCATION_RELATIONS, { recursive: true });
  });
});

describe('createSet(cellObject, callback)', () => {
  it('throws when cellObject does not have name property.', () => {
    return storage.createSet({})
      .catch(err => {
        assert.instanceOf(err, Error);
      })
  });

  it('should return id, which is generated for a set.', () => {
    return storage.createSet({ name: 'A' })
      .then(id => {
        assert.exists(id);
      })
  })
});

describe('intergration', () => {
  it('createSet -> getSetById', () => {
    let generatedId;
    return storage.createSet({ name: 'A' })
      .then(id => {
        generatedId = id;
        return storage.getSetById(id);
      })
      .then(set => {
        assert.deepEqual(set, { id: generatedId, name: 'A'});
      })
  });

  it('createSet -> updateSet -> getSetById', () => {
    let generatedId;
    return storage.createSet({ name: 'A' })
      .then(id => {
        generatedId = id;
        return storage.updateSet(id, { name: 'B' })
      })
      .then(() => {
        return storage.getSetById(generatedId);
      })
      .then(set => {
        assert.deepEqual(set, { id: generatedId, name: 'B'});
      })
  });

  it ('deleteSetById() throws if it has subset', async () => {
    let err;

    try {
      const id = await storage.createSet({ name: 'A' });
      await storage.createSetInSet({ name: 'B' }, id);
      await storage.deleteSet(id);
    } catch (e) {
      err = e;
    }

    assert.instanceOf(err, Error);
  });

  it('createSet -> createSetInSet -> deleteSet -> no cell and any relation', async () => {
    const id1 = await storage.createSet({ name: 'A' });
    const id2 = await storage.createSetInSet({ name: 'B' }, id1);

    await storage.deleteSet(id2);

    const subsets = await storage.getSubsetIds(id1);
    let id;

    try {
      id = await storage.getSetById(id2);
    } catch (e) {
      if (e.name !== 'NotFoundError') throw e;
    }

    assert.isEmpty(subsets);
    assert.isUndefined(id);
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
    ids.parent = await storage.createSet({ name: 'parent'});
    ids.child1 = await storage.createSetInSet({ name: 'child_1' }, ids.parent);
    ids.child2 = await storage.createSetInSet({ name: 'child_2' }, ids.parent);
    ids.grandchild = await storage.createSet({ name: 'grand_child' });
    await storage.putSetInSet(ids.grandchild, ids.child1);
    await storage.putSetInSet(ids.grandchild, ids.child2);
  });

  it('getSubsetCells(mainSetId, callback)', () => {
    return storage.getSubsetCells(ids.parent)
      .then(result => {
        assert.includeDeepMembers(result, [ { id: ids.child1, name: 'child_1' }, { id: ids.child2, name: 'child_2' } ]);
      })
  });

  it('getSubsetIds(mainSetId, callback)', () => {
    return storage.getSubsetIds(ids.parent)
      .then(result => {
        assert.includeMembers(result, [ ids.child1, ids.child2 ]);
      })
  });

  it('getSubsetsRecursively(biggestSetId, callback)', () => {
    return storage.getSubsetIdsRecursively(ids.parent)
      .then(result => {
        assert.includeMembers(result, [ ids.child1, ids.child2, ids.grandchild ]);
      })
  });

  it('getSubsetsRecursively(biggestSetId, callback)', () => {
    return storage.getSubsetCellsRecursively(ids.parent)
      .then(result => {
        assert.exists(result[0].id);
        assert.exists(result[1].id);
        assert.exists(result[2].id);
      })
  });

  it('getSupersetIds(setId)', () => {
    return storage.getSupersetIds(ids.grandchild)
      .then(result => {
        assert.includeMembers(result, [ ids.child1, ids.child2 ])
      })
  });

  it('getSupersetIdsRecursively(setId)', () => {
    return storage.getSupersetIdsRecursively(ids.grandchild)
      .then(result => {
        assert.includeMembers(result, [ ids.child1, ids.child2, ids.parent ])
      })
  });

  it('isSubsetOfSet(setId, biggerSetId)', () => {
    return storage.isSubsetOfSet(ids.grandchild, ids.parent)
      .then(result => {
        assert.equal(result, true);
      });
  })
});

describe('meaningless relation', () => {
  it('throws if meaningless shortcut is going to be created', async () => {
    const id1 = await storage.createSet({ name: 'A' });
    const id2 = await storage.createSetInSet({ name: 'B' }, id1);
    const id3 = await storage.createSetInSet({ name: 'C' }, id2);

    try {
      await storage.putSetInSet(id3, id1);
    } catch (e) {
      assert.include(e.message, 'Meaningless shortcut');
    }
  })
});

describe('circular set', () => {
  it('throws if circular set is going to be created', async () => {
    const id1 = await storage.createSet({ name: 'A' });
    const id2 = await storage.createSetInSet({ name: 'B' }, id1);

    try {
      await storage.putSetInSet(id1, id2);
    } catch (e) {
      assert.include(e.message, 'Circular set');
    }
  })
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
    ids.parent1 = await storage.createSet({ name: 'parent1'});
    ids.parent2 = await storage.createSet({ name: 'parent2'});
    ids.child = await storage.createSet({ name: 'child' });
    await storage.putSetInSet(ids.child, ids.parent1);
    await storage.putSetInSet(ids.child, ids.parent2);
    ids.grandchild = await storage.createSetInSet({ name: 'grand_child' }, ids.child);
  });
});
