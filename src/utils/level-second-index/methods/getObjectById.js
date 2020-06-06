module.exports = function getObjectById (objectId, callback) {
  return this.stores.id.get(objectId, (err, result) => {
    if (err) return callback(err);
    callback(null, {
      id: objectId,
      ...result,
    })
  });
};