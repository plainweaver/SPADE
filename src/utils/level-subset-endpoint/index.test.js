import fs from 'fs';
import { assert } from 'chai';
import levelup from 'levelup';
import rocksdb from 'rocksdb';
import sublevel from 'subleveldown';
import LevelGraph from 'levelgraph';
import LevelEndpoint from './index';
import LevelArray from '../level-array';
import LevelSubset from '../level-subset';
import LevelIndex from '../level-second-index';

const DIR = './storage/test/level-subset/endpoint';
const db = levelup(rocksdb(DIR));
const dbForCells = sublevel(db, 'cell');
const dbForRelations = sublevel(db, 'relation');
const dbForEndpoints = sublevel(db, 'endpoint');

let counter = 0;
const generateId = callback => { counter += 1; if (callback) return callback(null, counter.toString()); return counter.toString(); };
const subsetdb = LevelSubset(LevelIndex(dbForCells, { primaryIndex: 'id' }), LevelGraph(dbForRelations), generateId);
const storage = LevelEndpoint(subsetdb, dbForEndpoints);

// after(() => {
//   return Promise.all([
//     dbForCells.close(),
//     dbForRelations.close(),
//     dbForEndpoints.close()
//   ]).then(() => {
//     fs.rmdirSync(DIR, { recursive: true });
//   });
// });

describe('Endpoints', () => {
  beforeEach(async () => {
    async function resetDB(db) {
      const keys = [];
      await new Promise(res => db.createKeyStream().on('data', key => keys.push(key)).on('end', () => res()));
      await Promise.all(keys.map(key => db.del(key)));
    }

    counter = 0;
    await resetDB(dbForRelations);
    await resetDB(dbForCells);
    await resetDB(dbForEndpoints);
  });

  it('createDomain * 2 -> getRoots', async () => {
      await storage.createSet({ name: 'A' });
      await storage.createSet({ name: 'B' });
      const roots = await storage.getRoots();
      assert.deepEqual(roots, []);
  });

  it('should return [ A, B ] from [ A, A1, A2, B, B1, B2 ]', async () => {
    const setId = await storage.createSet({ name: 'A' });
    await storage.createSetInSet({ name: 'A1' }, setId);
    await storage.createSetInSet({ name: 'A2' }, setId);
    const setId2 = await storage.createSet({ name: 'B' });
    await storage.createSetInSet({ name: 'B1' }, setId2);
    await storage.createSetInSet({ name: 'B2' }, setId2);
    const endpoints = await storage.getEndpoints();
    assert.includeMembers(endpoints, [ setId, setId2 ])
  });

  // duplicated in test of level-subset, but keep leaving here because
  // it is possible level-subset have feature that modifies particle in discriminating.
  // in other words, just to ensure to prevent.
  it('throws for circular set 🜛', async () => {
    try {
      const setIdA = await storage.createSet({ name: 'A' });
      const setIdB = await storage.createSet({ name: 'B' });
      const setIdC = await storage.createSet({ name: 'C' });
      await storage.putSetInSet(setIdB, setIdA);
      await storage.putSetInSet(setIdC, setIdB);
      await storage.putSetInSet(setIdA, setIdC);
    } catch (e) {
      assert.include(e.message, 'Circular set');
    }
  })
});
