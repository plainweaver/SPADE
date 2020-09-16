"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = promisify;

// make callback function to support promise as well.
function createCallback() {
  let callback;
  const promise = new Promise(function (resolve, reject) {
    callback = function callback(err, value) {
      if (err) reject(err);else resolve(value);
    };
  });
  callback.promise = promise;
  return callback;
}
/**
 * Promisifies a function which takes the last argument as a callback.
 * @param functionWithCallback
 */


function promisify(functionWithCallback) {
  return function promisified(...args) {
    let callback;
    let promise;
    const lastParameter = args.pop();

    if (typeof lastParameter === 'function') {
      callback = lastParameter;
    }

    if (!callback) {
      callback = createCallback();
      promise = callback.promise;
    }

    functionWithCallback(...args, callback);
    return promise;
  };
}
//# sourceMappingURL=promisify.js.map