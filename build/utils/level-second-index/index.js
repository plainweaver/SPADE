"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _subleveldown = _interopRequireDefault(require("subleveldown"));

var _levelConcatIterator = _interopRequireDefault(require("level-concat-iterator"));

var _versatileFunction = require("../versatile-function");

var _levelAutoInc = _interopRequireDefault(require("../level-auto-inc"));

var _levelPrefixer = _interopRequireDefault(require("../level-prefixer"));

var _levelFixedKey = _interopRequireDefault(require("../level-fixed-key"));

var _IdGenerator = _interopRequireDefault(require("./IdGenerator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// storage.putObject(object, callback)
// storage.getObjectsByIndex(propertyKeyString, value) returns array of items
// for keys of IndexStore
const prefix = (0, _levelPrefixer.default)('!');
/**
 * When putting, each key of given object will be treated as an index.
 * @param db abstract-leveldown compatible store.
 * @param options delRecursive: Boolean, primaryIndex: String
 */

function LevelIndex(db, options = {}) {
  if (!(this instanceof LevelIndex)) {
    return new LevelIndex(db, options);
  }

  this.store = {}; // stores object consists of keys locating parts in indexed store

  this.store.main = (0, _subleveldown.default)(db, 'main', {
    valueEncoding: 'json'
  }); // reverse lookup store. (key: indexName + indexedValue, value: array of id of indexedObject)

  this.store.index = (0, _subleveldown.default)(db, 'index', {
    valueEncoding: 'json'
  });
  this.delRecursive = options.delRecursive;
  this.primaryIndex = options.primaryIndex;
  this.reuseId = options.reuseId || true; // overwrite & insert between order

  this.idGenerator = new _IdGenerator.default(this);
}

LevelIndex.prototype.putIndexedObject = (0, _versatileFunction.appendCallback)(async function (indexedObject) {
  const key = await this.idGenerator(indexedObject); // chunk out the object by indices and store them

  const promises = Object.keys(indexedObject).map(index => {
    return (async () => {
      const keyForIndexStore = prefix(index, indexedObject[index]); // find objects stored with same index

      let mains;

      try {
        mains = await this.store.index.get(keyForIndexStore);
      } catch (e) {
        if (e.name !== 'NotFoundError') throw e;else mains = [];
      } // put new ids array to reverse lookup store.


      mains.push(key);
      await this.store.index.put(keyForIndexStore, mains);
    })();
  });
  await _bluebird.default.all(promises);
  await this.store.main.put(key, indexedObject);
  return key;
}); // returns all of indexedObject

LevelIndex.prototype.getAll = (0, _versatileFunction.returnPromise)(0, function (callback) {
  (0, _levelConcatIterator.default)(this.store.main.iterator(), (err, result) => callback(err, result.map(x => x.value)));
});
LevelIndex.prototype.getByPrimaryValue = (0, _versatileFunction.appendCallback)(async function (indexedValue) {
  const mains = await this.store.index.get(prefix(this.primaryIndex, indexedValue));
  if (mains.length > 1) throw new Error('Multiple values have found with primary index. Unique value must be stored in primary index.');
  return await this.store.main.get(mains[0]);
});
LevelIndex.prototype.getByIndexedValue = (0, _versatileFunction.appendCallback)(async function (indexName, indexedValue) {
  const mains = await this.store.index.get(prefix(indexName, indexedValue));
  return await _bluebird.default.all(mains.map(id => this.store.main.get(id)));
});
LevelIndex.prototype.getByQueryObject = (0, _versatileFunction.appendCallback)(async function (queryObject) {
  const mainIds = await _bluebird.default.map(Object.keys(queryObject), indexName => {
    return this.store.index.get(prefix(indexName, queryObject[indexName]));
  });
  return await _bluebird.default.map(_lodash.default.intersection(...mainIds), mainId => {
    return this.store.main.get(mainId);
  });
});
LevelIndex.prototype.delByPrimaryValue = (0, _versatileFunction.appendCallback)(async function (indexedValue) {
  const mains = await this.store.index.get(prefix(this.primaryIndex, indexedValue));
  if (mains.length > 1) throw new Error('Multiple values have found with primary index. Unique value must be stored in primary index.');
  await this.store.main.del(mains[0]);
  await this.store.index.del(prefix(this.primaryIndex, indexedValue));
});
LevelIndex.prototype.delByIndexedValue = (0, _versatileFunction.appendCallback)(async function (indexName, indexedValue) {
  // primary keys of objects to be removed
  const mains = await this.store.index.get(prefix(indexName, indexedValue));
  if (!mains) throw new Error("[level-second-index] No indexedObjects found with given value.");
  if (mains.length > 1 && !this.delRecursive) throw new Error("[level-second-index] Cannot delete multiple indexedObject at once because option 'delRecursive' is set to false."); // deletes every indexedObjects

  _bluebird.default.each(mains, async mainPK => {
    // deletes one indexedObject
    const indexedObject = await this.store.main.get(mainPK);
    await _bluebird.default.each(Object.keys(indexedObject), async indexName => {
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
LevelIndex.prototype.delByQueryObject = (0, _versatileFunction.appendCallback)(async function (queryObject) {
  const mainIds = await _bluebird.default.map(Object.keys(queryObject), indexName => {
    return this.store.index.get(prefix(indexName, queryObject[indexName]));
  });
  return await _bluebird.default.map(_lodash.default.intersection(...mainIds), mainId => {
    return this.store.main.del(mainId);
  });
}); // -- experimental methods --

LevelIndex.prototype._getAllObjects = function () {};

LevelIndex.prototype._getAllIndices = function () {};

var _default = LevelIndex;
exports.default = _default;
//# sourceMappingURL=index.js.map