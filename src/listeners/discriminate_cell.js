export default async function process_types_and_relate(cell) {
  const types = this.typeDiscriminators.reduce((cell, dscr) => {
    return dscr(cell);
  }, cell);

  const typeIds = await Promise.all(types.map(type => {
    if (typeof type === 'string') type = { subject: type };
    return this.storageForTypes.get(type);
  }));

  const operations = typeIds.map(id => ({ subject: cell.info.id, predicate: 'isTypeOf', object: id }));

  await this.storageForRelations.put(operations);

  return operations;
}
