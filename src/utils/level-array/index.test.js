import fs from 'fs';
import levelup from 'levelup';
import rocksdb from 'rocksdb';
import LevelArray from './index'
import { assert } from 'chai';

const DB_LOCATION = './storage/test/level-array';
const db = levelup(rocksdb(DB_LOCATION));
const storage = LevelArray(db);

after(() => {
  return Promise.all([
    db.close(),
  ]).then(() => {
    fs.rmdirSync(DB_LOCATION, { recursive: true });
  });
});

describe('intergrated tests', () => {
  afterEach(() => {
    return storage.clear();
  });

  it('push -> pop', async () => {
    await storage.push('item');
    const result = await storage.pop();
    assert.exists(result);
  });

  it('push * 2 -> pop', async () => {
    await storage.push('first');
    await storage.push('second');
    const result = await storage.pop();
    assert.equal(result, 'second');
  });

  it('push -> shift', async () => {
    await storage.push('first');
    await storage.push('second');
    await storage.push('third');
    const result = await storage.shift();
    assert.equal(result, 'first');
    const second = await db.get(0);
    const third = await db.get(1);
    assert.equal(second, 'second');
    assert.equal(third, 'third');
  });

  it('push -> unshift', async () => {
    await storage.push('first');
    await storage.unshift('zero');
    const result = await db.get(0);
    assert.equal(result, 'zero');
  });

  it('indexOf', async () => {
    await storage.push('first');
    await storage.push('second');
    await storage.push('third');
    const index = await storage.indexOf('second');
    assert.equal(index, 1);
  })
});
