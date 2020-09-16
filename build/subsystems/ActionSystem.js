"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vm = _interopRequireDefault(require("vm"));

var _events = require("events");

var _extendsClasses = _interopRequireDefault(require("extends-classes"));

var _CategorySystem = _interopRequireDefault(require("./principle/CategorySystem"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ActionSystem extends (0, _extendsClasses.default)((0, _CategorySystem.default)('action'), _events.EventEmitter) {
  constructor(self) {
    super(self);
    process.nextTick(() => {
      this.shard = self.shard;
      this.particle = self.particle;
      this.domain = self.domain;
      this.event = self.event;
    });
  }
  /* override */


  on() {}

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
    const context = _vm.default.createContext({
      module: {}
    });

    const source = new _vm.default.SourceTextModule(code, {
      context
    });
    await source.link();
    await source.evaluate();
    this.emit('evaluate', context.module.exports);
  }

  analyze(code) {
    const analysis = {
      require: [],
      argument: [],
      global: [],
      binding: []
    };
    this.emit('analyze', analysis);
  }

  async process(particle) {
    const action = await this.evaluate(particle);
    this.event(action);
    await this.analyze(particle);
  }

}

exports.default = ActionSystem;
//# sourceMappingURL=ActionSystem.js.map