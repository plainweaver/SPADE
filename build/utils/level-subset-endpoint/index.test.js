"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _chai = require("chai");

var _levelup = _interopRequireDefault(require("levelup"));

var _rocksdb = _interopRequireDefault(require("rocksdb"));

var _subleveldown = _interopRequireDefault(require("subleveldown"));

var _levelgraph = _interopRequireDefault(require("levelgraph"));

var _index = _interopRequireDefault(require("./index"));

var _levelArray = _interopRequireDefault(require("../level-array"));

var _levelSubset = _interopRequireDefault(require("../level-subset"));

var _levelSecondIndex = _interopRequireDefault(require("../level-second-index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DIR = './storage/test/level-subset/endpoint';
const db = (0, _levelup.default)((0, _rocksdb.default)(DIR));
const dbForCells = (0, _subleveldown.default)(db, 'cell');
const dbForRelations = (0, _subleveldown.default)(db, 'relation');
const dbForEndpoints = (0, _subleveldown.default)(db, 'endpoint');
let counter = 0;

const generateId = callback => {
  counter += 1;
  if (callback) return callback(null, counter.toString());
  return counter.toString();
};

const subsetdb = (0, _levelSubset.default)((0, _levelSecondIndex.default)(dbForCells, {
  primaryIndex: 'id'
}), (0, _levelgraph.default)(dbForRelations), generateId);
const storage = (0, _index.default)(subsetdb, dbForEndpoints); // after(() => {
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
    await storage.createSet({
      name: 'A'
    });
    await storage.createSet({
      name: 'B'
    });
    const roots = await storage.getRoots();

    _chai.assert.deepEqual(roots, []);
  });
  it('should return [ A, B ] from [ A, A1, A2, B, B1, B2 ]', async () => {
    const setId = await storage.createSet({
      name: 'A'
    });
    await storage.createSetInSet({
      name: 'A1'
    }, setId);
    await storage.createSetInSet({
      name: 'A2'
    }, setId);
    const setId2 = await storage.createSet({
      name: 'B'
    });
    await storage.createSetInSet({
      name: 'B1'
    }, setId2);
    await storage.createSetInSet({
      name: 'B2'
    }, setId2);
    const endpoints = await storage.getEndpoints();

    _chai.assert.includeMembers(endpoints, [setId, setId2]);
  }); // duplicated in test of level-subset, but keep leaving here because
  // it is possible level-subset have feature that modifies particle in discriminating.
  // in other words, just to ensure to prevent.

  it('throws for circular set 🜛', async () => {
    try {
      const setIdA = await storage.createSet({
        name: 'A'
      });
      const setIdB = await storage.createSet({
        name: 'B'
      });
      const setIdC = await storage.createSet({
        name: 'C'
      });
      await storage.putSetInSet(setIdB, setIdA);
      await storage.putSetInSet(setIdC, setIdB);
      await storage.putSetInSet(setIdA, setIdC);
    } catch (e) {
      _chai.assert.include(e.message, 'Circular set');
    }
  });
});
//# sourceMappingURL=index.test.js.map