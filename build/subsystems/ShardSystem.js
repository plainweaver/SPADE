"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extendsClasses = _interopRequireDefault(require("extends-classes"));

var _events = require("events");

var _TransportBuilder = _interopRequireDefault(require("./principle/TransportBuilder"));

var _ProtocolBuilder = _interopRequireDefault(require("./principle/ProtocolBuilder"));

var _Permission = _interopRequireDefault(require("./principle/Permission"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// endpoint IR, building protocol particles -> world
// access-control, role-oriented, very declarative
// connects with various other hardwares
class ShardSystem extends (0, _extendsClasses.default)(_events.EventEmitter, _TransportBuilder.default, _ProtocolBuilder.default, _Permission.default) {
  constructor(self) {
    super();
    this.transports = [];
    this.protocols = [];
    this.mappings = {};
    process.nextTick(() => {
      this.particle = self.particle;
      this.action = self.action;
      this.domain = self.domain;
      this.event = self.event;
    });
  } // function determines boundary of group that consists of particle, action and domain.

  /**
   * @param name - name of determiner
   * @param func - callable function
   */


  createMapping(name, func) {
    this.mappings[name] = func;
  }

  removeMapping(name) {
    delete this.mapping[name];
  } // check if emitted data is valuable enough to do something with connected shards.


  process(eventName, data) {// todo
  }

}

exports.default = ShardSystem;
//# sourceMappingURL=ShardSystem.js.map