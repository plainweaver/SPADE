"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _levelup = _interopRequireDefault(require("levelup"));

var _memdown = _interopRequireDefault(require("memdown"));

var _levelConcatIterator = _interopRequireDefault(require("level-concat-iterator"));

var _versatileFunction = require("../versatile-function");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Memory that keeps up to date of hard storage.
 * Writes on source storage and then on a cache.
 * Reads from cache as it always contains latest data.
 */
function LevelSyncCache(db) {
  if (!(this instanceof LevelSyncCache)) {
    return new LevelSyncCache(db);
  }

  this.memory = (0, _levelup.default)((0, _memdown.default)());
  this.storage = db;
  this.queue = [];
  this.processing = false;
  const self = this;
  this.queue.createProcess = (0, _versatileFunction.returnPromise)(1, function (asyncFunc, callback) {
    const process = async function () {
      const result = await asyncFunc();
      self.queue.shift();
      if (callback) callback(null, result);

      if (self.queue.length > 0) {
        await self.queue[0]();
      } else {
        self.processing = false;
      }
    };

    if (!self.processing) {
      self.processing = true;
      self.queue.push(process());
    } else {
      self.queue.push(process);
    }
  }); // setup. loads all at launch

  this.queue.createProcess(async function () {
    const items = await new Promise((res, rej) => {
      (0, _levelConcatIterator.default)(db.iterator(), (err, data) => err ? rej(err) : res(data));
    });
    await Promise.all(items.map(({
      key,
      value
    }) => self.memory.put(key, value)));
  });
}

LevelSyncCache.prototype.get = (0, _versatileFunction.returnPromise)(1, function (key, callback) {
  const self = this;
  this.queue.createProcess(async function () {
    return await self.memory.get(key);
  }, callback);
});
LevelSyncCache.prototype.put = (0, _versatileFunction.returnPromise)(2, function (key, value, callback) {
  const self = this;
  this.queue.createProcess(async function () {
    await self.storage.put(key, value);
    await self.memory.put(key, value);
  }, callback);
});
LevelSyncCache.prototype.del = (0, _versatileFunction.returnPromise)(1, function (key, callback) {
  const self = this;
  this.queue.createProcess(async function () {
    await self.memory.del(key);
    await self.storage.del(key);
  }, callback);
});
var _default = LevelSyncCache;
exports.default = _default;
//# sourceMappingURL=index.js.map