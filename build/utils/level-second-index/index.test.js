"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _chai = require("chai");

var _levelup = _interopRequireDefault(require("levelup"));

var _rocksdb = _interopRequireDefault(require("rocksdb"));

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TEST_LOCATION = './storage/test/level-object';

_fs.default.mkdirSync(TEST_LOCATION, {
  recursive: true
});

const db = (0, _levelup.default)((0, _rocksdb.default)(TEST_LOCATION));
const storage = (0, _index.default)(db, {
  primaryIndex: 'id'
});
after(() => {
  return db.close(() => {
    _fs.default.rmdirSync(TEST_LOCATION, {
      recursive: true
    });
  });
});
beforeEach(() => {
  return db.clear();
});
describe('getAll()', () => {
  it('returns every items', async () => {
    const input = [{
      id: 1,
      some: 'first'
    }, {
      id: 2,
      some: 'second'
    }, {
      id: 3,
      some: 'third'
    }];
    await Promise.all(input.map(x => storage.putIndexedObject(x)));
    const output = await storage.getAll();

    _chai.assert.deepEqual(input, output);
  });
});
describe('putIndexedObject(object, callback)', () => {
  it('throws if object does not have id.', () => {
    return storage.putIndexedObject({
      some: 'value'
    }).catch(err => {
      _chai.assert.include(err.message, 'primaryIndex must be contained');
    });
  });
  it('throws if id is already in use.', async () => {
    try {
      await storage.putIndexedObject({
        id: 1,
        some: 'value'
      });
      await storage.putIndexedObject({
        id: 1,
        some: 'value'
      });
    } catch (e) {
      _chai.assert.include(e.message, 'already in use');
    }
  });
});
describe('put-get test', () => {
  beforeEach(() => {
    return db.clear();
  });
  it('finds objects with index.', async () => {
    await storage.putIndexedObject({
      id: 2,
      some: 'value'
    });
    await storage.putIndexedObject({
      id: 3,
      some: 'value'
    });
    const objects = await storage.getByIndexedValue('some', 'value');

    _chai.assert.deepEqual(objects, [{
      id: 2,
      some: 'value'
    }, {
      id: 3,
      some: 'value'
    }]);
  });
  it('finds objects with queryObject', async () => {
    await storage.putIndexedObject({
      id: 1,
      first: 'first',
      second: 'second'
    });
    await storage.putIndexedObject({
      id: 2,
      second: 'second',
      third: 'third'
    });
    await storage.putIndexedObject({
      id: 3,
      third: 'third'
    });
    const arr1 = await storage.getByQueryObject({
      second: 'second'
    });
    const arr2 = await storage.getByQueryObject({
      second: 'second',
      third: 'third'
    });

    _chai.assert.deepEqual(arr1, [{
      id: 1,
      first: 'first',
      second: 'second'
    }, {
      id: 2,
      second: 'second',
      third: 'third'
    }]);

    _chai.assert.deepEqual(arr2, [{
      id: 2,
      second: 'second',
      third: 'third'
    }]);
  });
});
describe('put-del-get test', () => {
  it('should not be found by getByIndexedValue', () => {
    return storage.putIndexedObject({
      id: 5,
      some: 'value'
    }).then(() => storage.delByIndexedValue('id', 5)).then(() => storage.getByIndexedValue('some', 'value')).catch(err => _chai.assert.equal(err.name, 'NotFoundError'));
  });
});
let storageWithoutPrimaryIndex;
describe('store constructed without primaryIndex', () => {
  beforeEach(async () => {
    await db.clear();
    storageWithoutPrimaryIndex = (0, _index.default)(db, {});
  });
  it('should generate auto key', async () => {
    const key0 = await storageWithoutPrimaryIndex.putIndexedObject({
      some: 'first'
    });
    const key1 = await storageWithoutPrimaryIndex.putIndexedObject({
      some: 'second'
    });

    _chai.assert.equal(key0, 0);

    _chai.assert.equal(key1, 1);
  });
  it('gets indexedObject after put with auto increment', async () => {
    await storageWithoutPrimaryIndex.putIndexedObject({
      firstName: 'Alice',
      lastName: 'Brown'
    });
    await storageWithoutPrimaryIndex.putIndexedObject({
      firstName: 'Bob',
      lastName: 'Brown'
    });
    const ids = await storage.getByIndexedValue('lastName', 'Brown');

    _chai.assert.deepEqual(ids, [{
      firstName: 'Alice',
      lastName: 'Brown'
    }, {
      firstName: 'Bob',
      lastName: 'Brown'
    }]);
  });
  it('throws when it takes identical indexedObject to one already stored.', async () => {
    try {
      await storageWithoutPrimaryIndex.putIndexedObject({
        some: 'value'
      });
      await storageWithoutPrimaryIndex.putIndexedObject({
        some: 'value'
      });
    } catch (e) {
      _chai.assert.include(e.message, 'Identical object');
    }
  });
});
//# sourceMappingURL=index.test.js.map