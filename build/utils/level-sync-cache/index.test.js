"use strict";

var _levelup = _interopRequireDefault(require("levelup"));

var _memdown = _interopRequireDefault(require("memdown"));

var _chai = require("chai");

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('setup loads all', () => {
  it('get', async () => {
    const hardStorage = (0, _levelup.default)((0, _memdown.default)());
    await hardStorage.put('1', '1');
    const cachedStorage = (0, _index.default)(hardStorage);
    const result = await cachedStorage.get('1');

    _chai.assert.exists(result);
  });
});
describe('data should be synced', () => {
  it('put-get', async () => {
    const hardStorage = (0, _levelup.default)((0, _memdown.default)());
    const cachedStorage = (0, _index.default)(hardStorage);
    await cachedStorage.put('1', '1');
    const result = await hardStorage.get('1');

    _chai.assert.exists(result);
  });
  it('put-del-get throws', async () => {
    const hardStorage = (0, _levelup.default)((0, _memdown.default)());
    const cachedStorage = (0, _index.default)(hardStorage);
    await cachedStorage.put('1', '1');
    await cachedStorage.del('1');

    try {
      await hardStorage.get('1');
    } catch (e) {
      _chai.assert.equal(e.name, 'NotFoundError');
    }
  });
});
//# sourceMappingURL=index.test.js.map