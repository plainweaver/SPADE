"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _levelup = _interopRequireDefault(require("levelup"));

var _rocksdb = _interopRequireDefault(require("rocksdb"));

var _index = _interopRequireDefault(require("./index"));

var _chai = require("chai");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DB_LOCATION = './storage/test/level-array';
const db = (0, _levelup.default)((0, _rocksdb.default)(DB_LOCATION));
const storage = (0, _index.default)(db);
after(() => {
  return Promise.all([db.close()]).then(() => {
    _fs.default.rmdirSync(DB_LOCATION, {
      recursive: true
    });
  });
});
describe('intergrated tests', () => {
  afterEach(() => {
    return storage.clear();
  });
  it('push -> pop', async () => {
    await storage.push('item');
    const result = await storage.pop();

    _chai.assert.exists(result);
  });
  it('push * 2 -> pop', async () => {
    await storage.push('first');
    await storage.push('second');
    const result = await storage.pop();

    _chai.assert.equal(result, 'second');
  });
  it('push -> shift', async () => {
    await storage.push('first');
    await storage.push('second');
    await storage.push('third');
    const result = await storage.shift();

    _chai.assert.equal(result, 'first');

    const second = await db.get(0);
    const third = await db.get(1);

    _chai.assert.equal(second, 'second');

    _chai.assert.equal(third, 'third');
  });
  it('push -> unshift', async () => {
    await storage.push('first');
    await storage.unshift('zero');
    const result = await db.get(0);

    _chai.assert.equal(result, 'zero');
  });
  it('indexOf', async () => {
    await storage.push('first');
    await storage.push('second');
    await storage.push('third');
    const index = await storage.indexOf('second');

    _chai.assert.equal(index, 1);
  });
});
//# sourceMappingURL=index.test.js.map