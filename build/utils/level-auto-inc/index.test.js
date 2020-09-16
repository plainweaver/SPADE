"use strict";

var _levelup = _interopRequireDefault(require("levelup"));

var _memdown = _interopRequireDefault(require("memdown"));

var _chai = require("chai");

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('construction', () => {
  it('get', async () => {
    const db = (0, _levelup.default)((0, _memdown.default)());
    await db.put('~counter', 5);
    const autoStorage = (0, _index.default)(db);
    const result = await autoStorage._getCurrentCount();

    _chai.assert.equal(result, 5);
  });
});
describe('integration', function () {
  it('starts with count 0', async () => {
    const db = (0, _levelup.default)((0, _memdown.default)());
    const storage = (0, _index.default)(db);
    const count = await storage.createKey();

    _chai.assert.equal(count, 0);
  });
  it('createKey', async () => {
    const db = (0, _levelup.default)((0, _memdown.default)());
    const storage = (0, _index.default)(db);
    const count0 = await storage.createKey();

    _chai.assert.equal(count0, 0);

    const count1 = await storage.createKey();

    _chai.assert.equal(count1, 1);
  });
  it('createKey -> _getCurrentCount', async () => {
    const db = (0, _levelup.default)((0, _memdown.default)());
    const storage = (0, _index.default)(db);
    await storage.createKey();
    const count0 = await storage._getCurrentCount();

    _chai.assert.equal(count0, 0);

    await storage.createKey();
    const count1 = await storage._getCurrentCount();

    _chai.assert.equal(count1, 1);
  });
  it('putWithAutoInc', async () => {
    const db = (0, _levelup.default)((0, _memdown.default)());
    const storage = (0, _index.default)(db);
    const count0 = await storage.putWithAutoInc('some value');

    _chai.assert.equal(count0, 0);

    const count1 = await storage.putWithAutoInc('some second value');

    _chai.assert.equal(count1, 1);
  });
});
//# sourceMappingURL=index.test.js.map