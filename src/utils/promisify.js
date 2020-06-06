function promisify () {
  let callback;
  const promise = new Promise(function (resolve, reject) {
    callback = function callback (err, value) {
      if (err) reject(err);
      else resolve(value)
    }
  });
  callback.promise = promise;
  return callback;
}

export default promisify;