"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = LevelHashSet;

var _crypto = _interopRequireDefault(require("crypto"));

var _promisify = _interopRequireDefault(require("./promisify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function changeToHash(data) {
  const buf = data.toString('base64');

  if (Buffer.byteLength(buf) < 32) {
    return data;
  } else {
    return _crypto.default.createHash('sha256').update(buf).digest('base64');
  }
} // todo since key is same as value, using hash-compressed value as a key can make it better.
// todo also, this can be done in multiple times and layers and we may configure manually for an application.
// todo like traditional CAM, parallel search in hardware would be nice.


function LevelHashSet(leveldb) {
  this._db = leveldb;
  this.size = leveldb.approximateSize;
}

LevelHashSet.prototype.add = function (value, callback) {
  let promise;

  if (!callback) {
    callback = (0, _promisify.default)();
    promise = callback.promise;
  }

  this.issueKey((err, key) => {
    this._db.put(data, key, err2 => {
      if (err || err2) {
        this.revokeKey(key);
        callback(err);
      } else {
        callback();
      }
    });
  });
  return promise;
};

LevelHashSet.prototype.delete = function (value, callback) {
  let promise;

  if (!callback) {
    callback = (0, _promisify.default)();
    promise = callback.promise;
  }

  this.issueKey((err, key) => {
    this._db.put(data, key, err2 => {
      if (err || err2) callback(err);else callback();
    });
  });
  return promise;
};

LevelHashSet.prototype.has = function (value, callback) {
  let promise;

  if (!callback) {
    callback = (0, _promisify.default)();
    promise = callback.promise;
  }

  this.db.get(changeToHash(value), (err, result) => {
    if (err) callback(err);

    if (result) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  });
  return promise;
};
//# sourceMappingURL=level-hash-set.js.map