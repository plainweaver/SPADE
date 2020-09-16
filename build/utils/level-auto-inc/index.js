"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _promisify = _interopRequireDefault(require("../promisify"));

var _versatileFunction = require("../versatile-function");

var _levelConcatIterator = _interopRequireDefault(require("level-concat-iterator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// todo) current mode is to skip empty numbers if they were deleted or something.
// todo) alternative mode would be queue processes and not to make empty numbers. This will not guarentee the order.
function LevelAutoInc(storage, options) {
  if (!(this instanceof LevelAutoInc)) {
    return new LevelAutoInc(storage, options);
  }

  if (!options) options = {};
  this.storage = storage;
  this.counterName = options.counterName || '~counter';
  this.storageForCounter = options.storageForCounter || storage;
  this.queue = [];
  this.processing = false;
  const self = this;
  this.createProcess = (0, _versatileFunction.returnPromise)(1, function (asyncFunc, callback) {
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
  }); // appends prototype functions to original storage.

  const prototype = { ...Object.getPrototypeOf(this)
  };
  Object.keys(prototype).forEach(name => {
    prototype[name] = prototype[name].bind(this);
  });
  Object.setPrototypeOf(this.storage, { ...Object.getPrototypeOf(this.storage),
    ...prototype
  });
  return this.storage;
}

LevelAutoInc.prototype.parseCount = function (data) {
  const str = data.toString();
  if (str === 'undefined') return 0;
  return parseInt(str);
};

LevelAutoInc.prototype._getCurrentCount = (0, _versatileFunction.appendCallback)(async function () {
  try {
    const count = await this.storageForCounter.get(this.counterName);
    return this.parseCount(count);
  } catch (e) {
    if (e.name !== 'NotFoundError') throw e;
    await this.storageForCounter.put(this.counterName, 'undefined');
    return undefined;
  }
});
LevelAutoInc.prototype.createKey = (0, _versatileFunction.appendCallback)(async function () {
  return await this.createProcess(async () => {
    const count = await this._getCurrentCount();
    await this.storageForCounter.del(this.counterName);

    if (count === undefined) {
      await this.storageForCounter.put(this.counterName, 0);
      return 0;
    } else {
      await this.storageForCounter.put(this.counterName, count + 1);
      return count + 1;
    }
  });
});
LevelAutoInc.prototype.putWithAutoInc = (0, _versatileFunction.appendCallback)(async function (value) {
  const key = await this.createKey();
  await this.storage.put(key, value);
  return key;
});
var _default = LevelAutoInc;
exports.default = _default;
//# sourceMappingURL=index.js.map