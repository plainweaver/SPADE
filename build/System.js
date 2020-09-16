"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ShardSystem = _interopRequireDefault(require("./subsystems/ShardSystem"));

var _ParticleSystem = _interopRequireDefault(require("./subsystems/ParticleSystem"));

var _ActionSystem = _interopRequireDefault(require("./subsystems/ActionSystem"));

var _DomainSystem = _interopRequireDefault(require("./subsystems/DomainSystem"));

var _EventSystem = _interopRequireDefault(require("./subsystems/EventSystem"));

var _Recorder = _interopRequireDefault(require("./Recorder"));

var _Overlays = _interopRequireDefault(require("./Overlays"));

var _Receptor = _interopRequireDefault(require("./Receptor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * to execute: emit from event system
 */
class System {
  constructor(config) {
    this.config = config;
    this.shard = new _ShardSystem.default(this);
    this.particle = new _ParticleSystem.default(this);
    this.action = new _ActionSystem.default(this);
    this.domain = new _DomainSystem.default(this);
    this.event = new _EventSystem.default(this);
    this.original = Object.freeze({ ...this
    });
    this.recorder = new _Recorder.default(this);
    this.overlays = new _Overlays.default(this);
    this.receptor = new _Receptor.default(this);
  }
  /* -- shortcuts below -- */

  /**
   * Applies overlays on the system.
   */


  use(...overlays) {
    return this.overlays.use(...overlays);
  }
  /**
   * Sets main function of the system.
   */


  set main(method) {
    if (typeof method === 'function') {
      this.receptor.main = method;
    }
  }

}

var _default = System;
exports.default = _default;
//# sourceMappingURL=System.js.map