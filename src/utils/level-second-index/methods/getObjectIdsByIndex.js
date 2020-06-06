module.exports = async function getObjectIdsByIndex (index, value, callback) {
  let ids;

  try {
    ids = await this.stores[index].get(value);
    ids = ids.split(',');
  } catch (e) {
    if (e.name === 'NotFoundError') ids = [];
    else throw e;
  }

  if (callback) callback(null, ids);

  return ids;
};