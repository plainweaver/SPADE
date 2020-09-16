"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function promisify() {
  let callback;
  const promise = new Promise(function (resolve, reject) {
    callback = function callback(err, value) {
      if (err) reject(err);else resolve(value);
    };
  });
  callback.promise = promise;
  return callback;
}

var _default = promisify;
exports.default = _default;
//# sourceMappingURL=promisify.js.map