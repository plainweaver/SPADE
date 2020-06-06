import levelup from 'levelup';
import memdown from 'memdown';
import { assert } from 'chai';
import cache from './index';

describe('setup loads all', () => {
  it('get', async () => {
    const hardStorage = levelup(memdown());
    await hardStorage.put('1', '1');
    const cachedStorage = cache(hardStorage);
    const result = await cachedStorage.get('1');
    assert.exists(result);
  });
});

describe('data should be synced', () => {
  it('put-get', async () => {
    const hardStorage = levelup(memdown());
    const cachedStorage = cache(hardStorage);
    await cachedStorage.put('1', '1');
    const result = await hardStorage.get('1');
    assert.exists(result);
  });

  it('put-del-get throws', async () => {
    const hardStorage = levelup(memdown());
    const cachedStorage = cache(hardStorage);
    await cachedStorage.put('1', '1');
    await cachedStorage.del('1');
    try {
      await hardStorage.get('1');
    } catch (e) {
      assert.equal(e.name, 'NotFoundError');
    }
  })
});
