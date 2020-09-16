"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = create_cell;

async function create_cell(data, info) {
  await this.storageForCells.put(data, info);
  return {
    data,
    info
  };
}
//# sourceMappingURL=create_cell.js.map