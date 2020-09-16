"use strict";

var _abstractLeveldown = require("abstract-leveldown");

var _util = require("util");

/*
 * Encoding-down for databases with optional transformation.
 */
module.exports = DB.default = DB;

function composeFunctions(funcs) {
  if (!funcs) return undefined;
  if (!Array.isArray(funcs)) return funcs;
  return function composedFunction(...args) {
    return funcs.reduce((acc, cur) => {
      if (Array.isArray(acc)) {
        return cur(...acc);
      } else {
        return cur(acc.key, acc.value);
      }
    }, args);
  };
}

function DB(db, options) {
  if (!(this instanceof DB)) return new DB(db, options);
  this._transformBefore = composeFunctions(options.transformBefore);
  this._transformAfter = composeFunctions(options.transformAfter);

  this._transformLtgt = composeFunctions(options.transformLtgt) || function (opts) {
    return opts;
  };

  this.db = db;
}

DB.prototype.serializeKey = function (data) {
  return data;
};

DB.prototype.serializeValue = function (data) {
  return data;
};

DB.prototype.open = function (opts, cb) {
  return this.db.open(opts, cb);
};

DB.prototype.close = function (cb) {
  return this.db.close(cb);
};

DB.prototype.put = function (key, value, opts, cb) {
  const transformed = this._transformBefore(key, value);

  return this.db.put(transformed.key, transformed.value, opts, cb);
};

DB.prototype.get = function (key, opts, cb) {
  const transformedKey = this._transformBefore(key);

  return this.db.get(transformedKey, opts, (err, value) => {
    cb(null, this._transformAfter(key, value));
  });
};

DB.prototype.del = function (key, opts, cb) {
  const transformedKey = this._transformBefore(key);

  return this.db.del(transformedKey, opts, cb);
};

DB.prototype.chainedBatch = function () {
  return new Batch(this);
};

DB.prototype.batch = function (ops, opts, cb) {
  ops = ops.map(op => {
    const transformed = op.value ? this._transformBefore(op.key, op.value) : this._transformBefore(op.key);
    return { ...op,
      ...transformed
    };
  });
  return this.db.batch(ops, opts, cb);
};

DB.prototype.iterator = function (opts) {
  return new Iterator(this, opts);
};

DB.prototype.clear = function (opts, callback) {
  opts = this._transformLtgt(opts);
  return this.db.clear(opts, callback);
};

function Iterator(db, opts) {
  _abstractLeveldown.AbstractIterator.call(this, db);

  this._transformBefore = db._transformBefore;
  this._transformAfter = db._transformAfter;
  this.opts = { ...opts,
    ...db._transformLtgt(opts),
    keys: true,
    values: true
  };
  this._oldOpts = opts;
  this.it = db.db.iterator(this.opts);
}

(0, _util.inherits)(Iterator, _abstractLeveldown.AbstractIterator);

Iterator.prototype.next = function (cb) {
  const self = this;
  return this.it.next(function (err, key, value) {
    console.log(self);
    if (err) return cb(err);

    const transformed = self._transformAfter(key, value);

    if (!self._oldOpts.keys) {
      transformed.key = transformed.value;
    }

    if (!self._oldOpts.value) {
      transformed.value = transformed.key;
    }

    if (transformed.key && self._oldOpts.keyAsBuffer) {
      if (typeof transformed.key === 'object') {
        transformed.key = JSON.stringify(transformed.key);
      }

      transformed.key = Buffer.from(transformed.key);
    }

    if (transformed.value && self._oldOpts.valueAsBuffer) {
      if (typeof transformed.value === 'object') {
        transformed.value = JSON.stringify(transformed.key);
      }

      transformed.value = Buffer.from(transformed.value);
    }

    cb(null, transformed.key, transformed.value);
  });
};

Iterator.prototype.seek = function (key) {
  return this.it.seek(key);
};

Iterator.prototype.end = function (cb) {
  return this.it.end(cb);
};

function Batch(db) {
  _abstractLeveldown.AbstractChainedBatch.call(this, db);

  this.batch = db.db.batch();
}

(0, _util.inherits)(Batch, _abstractLeveldown.AbstractChainedBatch);

Batch.prototype.put = function (key, value) {
  const transformed = this._transformBefore(key, value);

  return this.batch.put(transformed.key, transformed.value);
};

Batch.prototype.del = function (key) {
  key = this._transformBefore(key);
  return this.batch.del(key);
};

Batch.prototype.clear = function () {
  return this.batch.clear();
};

Batch.prototype.write = function (opts, cb) {
  return this.batch.write(opts, cb);
};
//# sourceMappingURL=level-transform.js.map