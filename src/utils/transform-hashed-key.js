// Must be used with transform-key-as-value.

// Replaces key of content that exceeds the size of 256bit (32byte) in base64
// into hashes self-describing content itself.

import crypto from 'crypto';
import promisify from './promisify';

function createHash(data) {
  return crypto.createHash('sha256').update(data).digest('base64');
}

function isOver32Bytes(data) {
  return Buffer.byteLength(data, 'base64') > 32;
}

// key without value is passed for GET or DEL.
// both key and value are passed before PUT.
export function transformBefore(key, value) {
  let promise;

  if (value !== undefined) {
    if (typeof value === 'object') {
      if (value.value) {
        throw new Error('value cannot have property named value. It is reserved for original value being hashed.')
      }
    } else {
      throw new Error('Storage, transformed to use key which is hashed from value, must take value an object that contains additional minimal information.');
    }
  }

  if (value !== undefined && key) {
    if (isOver32Bytes(key)) {
      if (value.value)
      return {
        key: createHash(key),
        value: { value: key, ...value },
      };
    } else {
      return {
        key: key,
        value: {},
      };
    }
  }

  else if (key) {
    if (isOver32Bytes(key)) {
      return createHash(key);
    } else {
      return key;
    }
  }
}

// always both key and value will be passed.
export function transformAfter(key, value) {
  if (!value.value) { // when key hasn't been replaced
    return {
      key: key,
      value: key,
    }
  } else {            // when key is hashed
    return {
      key: value.value,
      value: value.value,
    }
  }
}
