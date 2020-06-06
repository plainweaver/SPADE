import { EventEmitter } from 'events';
import classes from 'extends-classes';
import Category from './principle/CategorySystem';

export default class DomainSystem extends classes (Category('domain'), EventEmitter) {
  constructor(self) {
    super(self);

    process.nextTick(() => {
      this.shard = self.shard;
      this.particle = self.particle;
      this.action = self.action;
      this.event = self.event;
    })
  }

  async getNouns(queryObject) {
    return await this.queryCategories(queryObject);
  }

  async getObjects(noun) {
    return await this.getItemsByCategory(noun.id);
  }

  /**
   * Get all tags that can be imagined from a particle.
   */
  async classify(id, buffer) {
    const types = await this.listCategories();

    types.forEach(async function qualify(type) {
      const qualifier = await this.domain.getVerbs({ id: type.qualifier });
      const isType = await qualifier.evaluate()(buffer);
      if (isType) this.emit('qualify', id, type);
    })
  }

  async process(particle) {
    const domain = await this.parse(particle);
    this.event(domain);

    await this.classify(domain);
  }
}