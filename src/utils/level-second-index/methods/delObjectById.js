module.exports = async function delObjectById (objectId) {
  const object = await this.stores.id.get(objectId);

  const promises = Object.keys(object).map(key => {
    // update object indices
    return Promise.resolve()
      .then(() => {
        return this.stores[key].get(object[key]);
      })
      .then(ids => {
        const value = ids.split(',');
        value.splice(value.indexOf(objectId), 1);
        return this.stores[key].batch([
          { type: 'del', key: object[key] },
          { type: 'put', key: object[key], value: value },
        ]);
      });
  });

  await Promise.all(promises);
  await this.stores.id.del(objectId);
};