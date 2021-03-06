"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = LevelCAM;

var _crypto = _interopRequireDefault(require("crypto"));

var _promisify = _interopRequireDefault(require("./promisify"));

var _levelTransform = _interopRequireDefault(require("./level-transform"));

var _transformHashedKey = require("./transform-hashed-key");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// return utf-8 string, object
function createHash(data, info = {}) {
  if (Buffer.byteLength(data) < 32) {
    return {
      key: Buffer.from(data),
      value: { ...info
      }
    };
  } else {
    return {
      key: _crypto.default.createHash('sha256').update(data).digest(),
      value: { ...info,
        value: data
      }
    };
  }
} // todo v1 - simple key generation
// todo v2 - fixed radix
// todo v3 - dynamic recursive radix
// todo v4 - use different storages by layers, each scoped.


function LevelCAM(storage) {
  if (!(this instanceof LevelCAM)) {
    return new LevelCAM(storage);
  }

  this.storage = storage;
}

LevelCAM.prototype.get = function (data, callback) {
  let promise;

  if (!callback) {
    callback = (0, _promisify.default)();
    promise = callback.promise;
  }

  Promise.resolve().then(() => {
    return this.storage.get(createHash(data).key);
  }).then(value => {
    callback(null, value);
  }).catch(e => {
    callback(e);
  });
  return promise;
};

LevelCAM.prototype.put = function (data, info, callback) {
  let promise;

  if (info && info.value) {
    throw new Error('Argument info cannot have property named value.');
  }

  if (typeof info === 'function') {
    callback = info;
  }

  if (!callback) {
    callback = (0, _promisify.default)();
    promise = callback.promise;
  }

  console.log(data);
  const {
    key,
    value
  } = createHash(data, info);
  Promise.resolve().then(() => {
    return this.storage.put(key, value);
  }).then(() => {
    callback(null, key);
  }).catch(e => {
    callback(e);
  });
  return promise;
};

LevelCAM.prototype.del = async function (data, callback) {
  let promise;

  if (!callback) {
    callback = (0, _promisify.default)();
    promise = callback.promise;
  }

  const {
    key
  } = createHash(data);
  Promise.resolve().then(() => {
    return this.storage.del(key);
  }).then(() => {
    callback();
  }).catch(e => {
    callback(e);
  });
  return promise;
};

LevelCAM.prototype.has = function (data, callback) {
  let promise;

  if (!callback) {
    callback = (0, _promisify.default)();
    promise = callback.promise;
  }

  const {
    key
  } = createHash(data);
  this.storage.get(key).then(key => {
    callback(null, !!key);
  }).catch(e => {
    if (e.name !== 'NotFoundError') {
      callback(e);
    }
  });
  return promise;
}; // LevelCAM.prototype.createReadStream = function(...args) {
//   return this.storage.createReadStream({
//     key:
//   })
// };
//
// LevelCAM.prototype.createKeyStream = function(...args) {
//   return this.storage.rangedSearch.createKeyStream(...args);
// };
//
// LevelCAM.prototype.createValueStream = function(...args) {
//   return this.storage.rangedSearch.createValueStream(...args);
// };
//
// LevelCAM.prototype.iterator = function(...args) {
//   return this.storage.rangedSearch.iterator(...args);
// };
//# sourceMappingURL=level-cam.js.map