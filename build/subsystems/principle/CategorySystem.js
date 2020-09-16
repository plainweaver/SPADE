"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _index = _interopRequireDefault(require("../../../utils/level-second-index/index"));

var _subleveldown = _interopRequireDefault(require("subleveldown"));

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CategorySystemCore {
  constructor(self, namespace) {
    const storage = self.particle.grantStorage('abstract');
    this.category = (0, _index.default)((0, _subleveldown.default)(storage, namespace + '/category'));
    this.item = (0, _index.default)((0, _subleveldown.default)(storage, namespace + '/item'));
  }

  async listCategories() {
    return await this.category.getAll();
  }

  async createCategory(name, metadata) {
    await this.category.putIndexedObject({
      name,
      ...metadata
    });
  }

  async queryCategories(queryObject) {
    return await this.category.getByQueryObject(queryObject);
  }

  async getItemsByCategory(categoryId) {
    const relations = await this.item.getByQueryObject({
      categoryId
    });
    return relations.map(rel => rel.itemId);
  }

  async getCategoriesByItem(itemId) {
    const relations = await this.item.getByQueryObject({
      itemId
    });
    return _bluebird.default.each(relations, rel => this.category.getByPrimaryValue(rel.categoryId));
  }

  async createItem(categoryId, itemId) {
    await this.item.putIndexedObject({
      categoryId,
      itemId
    });
  }

}
/**
 * Set namespace to distinguish between multiple subsystems.
 */


function _default(namespace) {
  class CategorySystem extends CategorySystemCore {
    constructor(self) {
      super(self, namespace);
    }

  }

  return CategorySystem;
}
//# sourceMappingURL=CategorySystem.js.map