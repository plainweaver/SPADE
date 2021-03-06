import peek from 'level-peek';
import { appendCallback, createCallback, returnPromise } from '../versatile-function';

function LevelArray(db) {
  if (!(this instanceof LevelArray)) {
    return new LevelArray(db);
  }

  this.db = db;
  this.lastIndex = undefined;
}

LevelArray.prototype.createReadStream = function() {};

LevelArray.prototype.createKeyStream = function() {};

LevelArray.prototype.createValueStream = function() {};

LevelArray.prototype.unshift = appendCallback(async function(value) {
  const self = this;
  const iterator = self.db.iterator({ lt: 'z', reverse: true });

  await new Promise((res, rej) => {
    async function moveBackward(err, key, value) {
      if (err) return rej(err);
      if (!key) return iterator.end(res);
      await self.db.del(parseInt(key.toString()));
      await self.db.put(parseInt(key.toString()) + 1, value);
      iterator.next(moveBackward);
    }

    iterator.next(moveBackward);
  });

  await self.db.put(0, value);
  return this.lastIndex += 1;
});

LevelArray.prototype.shift = appendCallback(async function() {
  const self = this;
  const iterator = self.db.iterator({ gt: 0 });
  const item = await self.db.get(0);
  await this.db.del(0);

  await new Promise((res, rej) => {
    async function moveForward(err, key, value) {
      if (err) return rej(err);
      if (!key) return iterator.end(res);
      await self.db.del(parseInt(key.toString()));
      await self.db.put(parseInt(key.toString()) - 1, value);
      iterator.next(moveForward);
    }

    iterator.next(moveForward);
  });

  this.lastIndex -= 1;
  return item;
});

LevelArray.prototype.push = appendCallback(async function(value) {
  const lastIndex = await this._lastIndex();
  await this.db.put(lastIndex + 1, value);
  return this.lastIndex += 1;
});

LevelArray.prototype.pop = appendCallback(async function() {
  const lastIndex = await this._lastIndex();
  if (lastIndex === -1) return undefined;
  const value = await this.db.get(lastIndex);
  await this.db.del(lastIndex);
  this.lastIndex -= 1;
  return value;
});

LevelArray.prototype.includes = appendCallback(async function(value) {
  return !!(await this.indexOf(value));
});

LevelArray.prototype.indexOf = returnPromise(1, function (element, callback) {
  const stream = this.db.createReadStream();
  stream.on('data', data => {
      if (element === data.value.toString()) {
        callback(null, parseInt(data.key.toString()));
        stream.destroy();
      }
    })
    .on('end', function () {
      callback(null, -1);
    })
    .on('error', err => callback(err));
});

LevelArray.prototype.length = appendCallback(async function() {
  const index = await this._lastIndex();
  return index + 1;
});

LevelArray.prototype._lastIndex = appendCallback(async function() {
  if (this.lastIndex === undefined) {
    const index = await new Promise((res, rej) => {
      peek.last(this.db, { end: 'z' }, (err, key) => {
        if (err) return rej(err);
        res(key);
      });
    });
    this.lastIndex = index ? parseInt(index.toString()) : -1;
  }

  return this.lastIndex;
});

LevelArray.prototype.clear = appendCallback(async function() {
  const keys = [];
  await new Promise(res => this.db.createKeyStream()
    .on('data', key => keys.push(key))
    .on('end', () => res())
  );

  if (keys.length > 0) {
    await this.db.batch(keys.map(key => ({ type: 'del', key })));
    this.lastIndex = -1;
  }
});

LevelArray.prototype._getAll = returnPromise(0, function(callback) {
  const result = [];
  this.db.createReadStream()
    .on('data', data => result.push(data.value.toString()))
    .on('end', () => callback(null, result))
    .on('error', err => callback(err));
});

//
// Array.prototype.join = returnPromise(1, Array.prototype.join);
//
// Array.prototype.splice = returnPromise((...args) => {
//   const lastArg = args.pop();
//   return typeof lastArg === 'function' ? createCallback(lastArg) : createCallback();
// }, Array.prototype.splice);
//
// Array.prototype.indexOf = returnPromise(1, Array.prototype.indexOf);

export default LevelArray;
