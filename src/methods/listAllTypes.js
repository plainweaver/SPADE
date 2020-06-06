import promisify from './promisify';

function listAllTypes(callback) {
  this.storageForTypes.search({ subject: this.storageForTypes.v('x') }, (err, results) => {
    if (err) return callback(err);
    callback(results);
  });
}

export default promisify(listAllTypes);
