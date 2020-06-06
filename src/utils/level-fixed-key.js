import promisify from './promisify';
import { appendCallback, returnPromise } from './versatile-function';

// todo) current mode is to skip empty numbers if they were deleted or something.
// todo) alternative mode would be queue processes and not to make empty numbers. This will not guarentee the order.

module.exports = function (storage, keyName, { mockKeyArg }) {
  const fixedStorage = { ...storage };

  if (!mockKeyArg) mockKeyArg = true;

  fixedStorage.put = appendCallback(async function(key, value) {
    if (!mockKeyArg) value = key;
    return await storage.put(keyName, value);
  });

  fixedStorage.get = appendCallback(async function() {
    return await storage.get(keyName);
  });

  fixedStorage.del = appendCallback(async function() {
    return await storage.del(keyName);
  });

  return fixedStorage;
};
