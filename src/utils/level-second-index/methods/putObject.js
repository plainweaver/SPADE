module.exports = async function putObject(object) {
  // this.stores.id is special since it stores entire object.
  if (!object.id) throw new Error('object must have id');
  const objectId = object.id;
  delete object.id;
  await this.stores.id.put(objectId, object);

  async function indexObject(indexStore, propertyValue, objectId) {
    // indexStore key: property key of object, value: array of ids of objects
    // indexStore will indicate which objects had a key named as given.
    let ids;

    try {
      ids = await indexStore.get(propertyValue);
      ids = ids.split(',');
    } catch (e) {
      if (e.name === 'NotFoundError')
        ids = [];
      else if (e.message.includes("Cannot read property 'get'"))
        throw new Error('Index storage had to be constructed for each object key. Unprepared object key has been passed.');
      else throw e;
    }

    if (!ids.includes(objectId)) ids.push(objectId);
    await indexStore.del(propertyValue);
    await indexStore.put(propertyValue, ids);
  }

  await Promise.all(Object.keys(object).map(key => {
    return indexObject(this.stores[key], object[key], objectId);
  }));
};