"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _levelup = _interopRequireDefault(require("levelup"));

var _rocksdb = _interopRequireDefault(require("rocksdb"));

var _chai = require("chai");

var _Domain = require("./Domain");

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOCATION_DB = './storage/test/level-domain';
const db = (0, _levelup.default)((0, _rocksdb.default)(LOCATION_DB));
const storage = (0, _index.default)(db);
after(async () => {
  await db.close();

  _fs.default.rmdirSync(LOCATION_DB, {
    recursive: true
  });
});
/*
processParticle
getParticlesByDomainId
listAllDomains
getSubDomains
getDomainNameById
getDomainIdsByName
leaveIntersectionOnly
createDomain
createSubDomain
disableComplement
setDomainDiscriminator
 */

describe('Get domain', () => {
  beforeEach(() => {
    return db.clear();
  });
  it('returns empty array if no domains found', async () => {
    const domains = await storage.getAllDomains();

    _chai.assert.deepEqual(domains, []);
  });
  it('get executable domain', async () => {
    await storage.createDomain({
      domainName: 'apple',
      dscrCode: () => {
        return 5;
      }
    });
    const [domain] = await storage.getDomains({
      name: 'apple'
    });

    _chai.assert.equal(domain.name, 'apple');

    _chai.assert.equal(domain.dscr(), 5);
  });
});
describe('Particles', () => {
  it('returns all particles', () => {
    const domain = new _Domain.ExecutableDomain({
      name: 'apple',
      dscr: () => {}
    });
  });
}); // describe('level-subset compatibility', () => {
//   it('createDomain(setCell, callback)', () => {
//     return storage.createDomain({ name: 'A', dscr: () => true, })
//       .then(id => {
//         dbForSetCells.createReadStream()
//           .on('data', data => console.log(data.key.toString(), data.value.toString()));
//         assert.exists(id);
//       })
//   })
//
//   //...
// });
//
// describe('updateDomainDscr()', () => {
//   it('createDomain -> updateDomainDscr -> getDomain has function as dscr.', async () => {
//     const id = await storage.createDomain({ name: 'A' });
//     await storage.updateDomainDscr(id, `return value === 'a'`, [ 'a' ]);
//     const set = await storage.getDomainById(id);
//
//     assert.typeOf(set.dscr, 'function');
//   });
// });
//
// describe('processParticle()', () => {
//   it('createDomain -> processParticle -> getParticlesByDomainId', async () => {
//     const script = new vm.Script(function hello() { return 5; });
//     console.log('!!!!', script)
//     const id = await storage.createDomain({ name: 'A' });
//     await storage.processParticle({ info: { address: 'ADDR' } })
//   })
// });
//# sourceMappingURL=index.test.js.map