import levelup from 'levelup';
import memdown from 'memdown';
import { assert } from 'chai';
import autoinc from './index';

describe('construction', () => {
  it('get', async () => {
    const db = levelup(memdown());
    await db.put('~counter', 5);
    const autoStorage = autoinc(db);
    const result = await autoStorage._getCurrentCount();
    assert.equal(result, 5);
  });
});

describe('integration', function () {
  it('starts with count 0', async () => {
    const db = levelup(memdown());
    const storage = autoinc(db);
    const count = await storage.createKey();
    assert.equal(count, 0);
  });

  it('createKey', async () => {
    const db = levelup(memdown());
    const storage = autoinc(db);
    const count0 = await storage.createKey();
    assert.equal(count0, 0);
    const count1 = await storage.createKey();
    assert.equal(count1, 1);
  });

  it('createKey -> _getCurrentCount', async () => {
    const db = levelup(memdown());
    const storage = autoinc(db);
    await storage.createKey();
    const count0 = await storage._getCurrentCount();
    assert.equal(count0, 0);
    await storage.createKey();
    const count1 = await storage._getCurrentCount();
    assert.equal(count1, 1);
  });

  it('putWithAutoInc', async () => {
    const db = levelup(memdown());
    const storage = autoinc(db);
    const count0 = await storage.putWithAutoInc('some value');
    assert.equal(count0, 0);
    const count1 = await storage.putWithAutoInc('some second value');
    assert.equal(count1, 1);
  })
});
