const defs = {
  spo: ['subject', 'predicate', 'object'],
  sop: ['subject', 'object', 'predicate'],
  pos: ['predicate', 'object', 'subject'],
  pso: ['predicate', 'subject', 'object'],
  ops: ['object', 'predicate', 'subject'],
  osp: ['object', 'subject', 'predicate'],
};

// key without value is passed for GET or DEL.
// both key and value are passed before PUT.
export function transformBefore(key, value) {
  console.log(key, value);
  if (value === undefined) {
    return {
      key: key,
    };
  }

  if (key && value !== undefined) {
    return {
      key: key,
      value: '',
    }
  }
}

// always both key and value will be passed.
export function transformAfter(originalKey, emptyValue) {
  function transformKeyToValue(originalKey) {
    const chunks = originalKey.split('::');
    const type = chunks.shift();
    const def = defs[type];

    return chunks.reduce(function (acc, cur, index) {
      acc[def[index]] = cur;
      return acc;
    }, {});
  }

  if (!originalKey && !emptyValue) {
    return {
      key: undefined,
      value: undefined,
    };
  }

  if (originalKey && emptyValue) {
    const key = originalKey.toString();
    return {
      key: key,
      value: JSON.stringify(transformKeyToValue(key)),
    }
  }
}

export function transformLtgt(options) {

}
