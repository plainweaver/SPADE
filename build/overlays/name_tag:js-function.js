"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

/**
 * shard becomes outer connector, the others become inner processor
 * S ───┐
 * └── PADE
 **/
function _default(system, layers) {
  // inner protocol
  system.particle.addParticle = () => {};

  system.event.addOnceEvent = () => {};

  system.event.removeOnceEvent = () => {};

  system.shard.parseBufferToJs = function (buffer) {}; // external apis


  system.shard.get = async function (name) {
    const particleId = await system.event.inventory.getIntuition(name);
    const buffer = await this;
  };

  system.shard.set = () => {};

  system.shard.call = () => {
    console.log('called');
  };

  console.log('set');
}
//# sourceMappingURL=name_tag:js-function.js.map