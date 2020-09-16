"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

var _extendsClasses = _interopRequireDefault(require("extends-classes"));

var _CategorySystem = _interopRequireDefault(require("./principle/CategorySystem"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DomainSystem extends (0, _extendsClasses.default)((0, _CategorySystem.default)('domain'), _events.EventEmitter) {
  constructor(self) {
    super(self);
    process.nextTick(() => {
      this.shard = self.shard;
      this.particle = self.particle;
      this.action = self.action;
      this.event = self.event;
    });
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
      const qualifier = await this.domain.getVerbs({
        id: type.qualifier
      });
      const isType = await qualifier.evaluate()(buffer);
      if (isType) this.emit('qualify', id, type);
    });
  }

  async process(particle) {
    const domain = await this.parse(particle);
    this.event(domain);
    await this.classify(domain);
  }

}

exports.default = DomainSystem;
//# sourceMappingURL=DomainSystem.js.map