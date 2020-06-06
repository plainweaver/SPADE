import vm from 'vm';
import { EventEmitter } from 'events';
import classes from 'extends-classes';
import Category from './principle/CategorySystem';

export default class ActionSystem extends classes (Category('action'), EventEmitter) {
  constructor(self) {
    super(self);

    process.nextTick(() => {
      this.shard = self.shard;
      this.particle = self.particle;
      this.domain = self.domain;
      this.event = self.event;
    });
  }

  /* override */ on() {

  }

  async getVerbs(queryObject) {
    return await this.queryCategories(queryObject);
  }

  async getFunctions(abstract) {
    return await this.getItemsByCategory(abstract.id);
  }

  parse(buffer) {
    try {
      return buffer.toString();
    } catch (e) {}
  }

  async evaluate(code) {
    const context = vm.createContext({ module: {} });
    const source = new vm.SourceTextModule(code, { context });
    await source.link();
    await source.evaluate();
    this.emit('evaluate', context.module.exports);
  }

  analyze(code) {
    const analysis = {
      require: [],
      argument: [],
      global: [],
      binding: [],
    };

    this.emit('analyze', analysis);
  }

  async process(particle) {
    const action = await this.evaluate(particle);
    this.event(action);

    await this.analyze(particle);
  }
}
