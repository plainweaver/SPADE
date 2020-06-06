export default async function create_cell(data, info) {
  await this.storageForCells.put(data, info);

  return {
    data,
    info,
  }
}