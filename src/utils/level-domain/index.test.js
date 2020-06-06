import fs from 'fs';
import levelup from 'levelup';
import rocksdb from 'rocksdb';
import { assert } from 'chai';
import { ExecutableDomain } from './Domain';
import LevelDomain from './index';

const LOCATION_DB = './storage/test/level-domain';
const db = levelup(rocksdb(LOCATION_DB));
const storage = LevelDomain(db);

after(async () => {
  await db.close();
  fs.rmdirSync(LOCATION_DB, { recursive: true });
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
    assert.deepEqual(domains, []);
  });

  it('get executable domain', async () => {
    await storage.createDomain({ domainName: 'apple', dscrCode: () => { return 5; } });
    const [ domain ] = await storage.getDomains({ name: 'apple' });
    assert.equal(domain.name, 'apple');
    assert.equal(domain.dscr(), 5);
  });
});


describe('Particles', () => {
  it('returns all particles', () => {
    const domain = new ExecutableDomain({ name: 'apple', dscr: () => {}});

  })
});

// describe('level-subset compatibility', () => {
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
