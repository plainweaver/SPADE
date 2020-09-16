"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _subleveldown = _interopRequireDefault(require("subleveldown"));

var _levelArray = _interopRequireDefault(require("../level-array"));

var _versatileFunction = require("../versatile-function");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Adds features, that are related to endpoints, to level-subset.
 */
function LevelSubsetEndpoint(levelsubset, endpointdb) {
  if (!(this instanceof LevelSubsetEndpoint)) {
    return new LevelSubsetEndpoint(levelsubset, endpointdb);
  }

  const rootdb = (0, _levelArray.default)((0, _subleveldown.default)(endpointdb, 'root'));
  const leafdb = (0, _levelArray.default)((0, _subleveldown.default)(endpointdb, 'leaf'));
  const prototype = {
    createSet: async function (cell) {
      const id = await levelsubset.createSet(cell);
      await rootdb.push(id);
      return id;
    },
    createSetInSet: async function (targetSetId, parentSetId) {
      // find out it is circular
      const exist = await levelsubset.createSetInSet(targetSetId, parentSetId); // throw error if set creating right
    },
    putSetInAnotherSet: async function (targetSetId, parentSetId) {
      let exist;

      try {
        exist = await levelsubset.get({
          subject: targetSetId,
          predicate: 'isSubsetOf',
          object: parentSetId
        });
      } catch (e) {
        if (e.name !== 'NotFoundError') throw e;
      }

      if (exist) {
        throw new Error('Cannot put set in another set, it is already a subset.');
      }

      await levelsubset.put({
        subset: targetSetId,
        predicate: 'isSubsetOf',
        object: parentSetId
      });
    }
  };
  const storage = Object.assign({
    root: rootdb,
    leaf: leafdb
  }, levelsubset);
  Object.setPrototypeOf(storage, { ...Object.getPrototypeOf(levelsubset),
    ...LevelSubsetEndpoint.prototype,
    ...prototype
  });
  return storage;
}

LevelSubsetEndpoint.prototype.getRoots = (0, _versatileFunction.returnPromise)(0, async function () {
  return await this.root._getAll();
});
LevelSubsetEndpoint.prototype.getLeaves = (0, _versatileFunction.returnPromise)(0, async function (callback) {
  return await this.leaf._getAll();
});
var _default = LevelSubsetEndpoint;
exports.default = _default;
//# sourceMappingURL=index.js.map