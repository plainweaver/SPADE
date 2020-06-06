import indexed from '../../../utils/level-second-index/index';
import sublevel from 'subleveldown';
import Promise from 'bluebird';

class CategorySystemCore {
  constructor(self, namespace) {
    const storage = self.particle.grantStorage('abstract');
    this.category = indexed(sublevel(storage, namespace + '/category'));
    this.item = indexed(sublevel(storage, namespace + '/item'));
  }

  async listCategories() {
    return await this.category.getAll();
  }

  async createCategory(name, metadata) {
    await this.category.putIndexedObject({ name, ...metadata });
  }

  async queryCategories(queryObject) {
    return await this.category.getByQueryObject(queryObject);
  }

  async getItemsByCategory(categoryId) {
    const relations = await this.item.getByQueryObject({ categoryId });
    return relations.map(rel => rel.itemId);
  }

  async getCategoriesByItem(itemId) {
    const relations = await this.item.getByQueryObject({ itemId });
    return Promise.each(relations, rel => this.category.getByPrimaryValue(rel.categoryId));
  }

  async createItem(categoryId, itemId) {
    await this.item.putIndexedObject({ categoryId, itemId });
  }
}

/**
 * Set namespace to distinguish between multiple subsystems.
 */
export default function (namespace) {
  class CategorySystem extends CategorySystemCore {
    constructor(self) {
      super(self, namespace)
    }
  }

  return CategorySystem;
}
