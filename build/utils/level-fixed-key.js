"use strict";

var _promisify = _interopRequireDefault(require("./promisify"));

var _versatileFunction = require("./versatile-function");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// todo) current mode is to skip empty numbers if they were deleted or something.
// todo) alternative mode would be queue processes and not to make empty numbers. This will not guarentee the order.
module.exports = function (storage, keyName, {
  mockKeyArg
}) {
  const fixedStorage = { ...storage
  };
  if (!mockKeyArg) mockKeyArg = true;
  fixedStorage.put = (0, _versatileFunction.appendCallback)(async function (key, value) {
    if (!mockKeyArg) value = key;
    return await storage.put(keyName, value);
  });
  fixedStorage.get = (0, _versatileFunction.appendCallback)(async function () {
    return await storage.get(keyName);
  });
  fixedStorage.del = (0, _versatileFunction.appendCallback)(async function () {
    return await storage.del(keyName);
  });
  return fixedStorage;
};
//# sourceMappingURL=level-fixed-key.js.map