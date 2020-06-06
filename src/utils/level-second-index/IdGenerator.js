import sublevel from 'subleveldown';
import autoinc from '../level-auto-inc';
import deepEqual from 'deep-equal';

// todo) decide how to distinguish between indexedObjects.
// 1. give nothing to use built-in auto incrementer internally. Same objects will be rejected.
// 2. give string of index name that will work as unique identifier.
// 3. give function to manually generate id
function Generator(self) {
  if (!self.primaryIndex) {
    // setup auto incrementer
    self.store.main = autoinc(self.store.main);

    return async function generateId(indexedObject) {
      if (!self.reuseId && indexedObject.id) throw new Error('[level-second-index] id cannot be exist in indexedObject ' +
        'since no primaryIndex is specified and ids are being generated auto incrementally.');

      if (self.reuseId && indexedObject.id) {
        return indexedObject.id;
      }

      return await self.store.main.createKey();
    }
  }

  if (typeof self.primaryIndex === 'string') {
    return async function generateId(indexedObject) {
      if (self.primaryIndex in indexedObject) {
        const key = indexedObject[self.primaryIndex];

        let exist;
        try {
          exist = await self.store.main.get(key);
        } catch (e) {
          if (e.name === 'NotFoundError') {
          } else throw e;
        }

        if (exist) throw new Error('[level-second-index] value with primaryIndex is already in use.');
        else {
          return key;
        }
      }

      else throw new Error('[level-second-index] primaryIndex must be contained in indexedObject.')
    };
  }

  if (typeof self.primaryIndex === 'function') {
    return async (indexedObject) => await self.primaryIndex(indexedObject);
  }
}

export default Generator;
