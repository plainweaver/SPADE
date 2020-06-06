module.exports = function (seperator) {
  if (!seperator) seperator = '!';
  const sepBuffer = toBuffer(seperator);

  return function (prefix, key) {
    function stringify(data) {
      if (typeof data === 'number') data = data.toString();
      else if (typeof data === 'object') data = JSON.stringify(data);

      return data;
    }

    prefix = stringify(prefix);
    key = stringify(key);

    if (typeof key === 'string') return seperator + prefix + seperator + key;
    else if (Buffer.isBuffer(key)) return Buffer.concat([sepBuffer, toBuffer(prefix), sepBuffer, key]);

    throw new TypeError('unsupported type of prefix or key.');
  }
};

function toBuffer (value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(value)
}
