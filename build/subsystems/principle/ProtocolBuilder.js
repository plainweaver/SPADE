"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stream = require("stream");

class Protocol extends _stream.Transform {
  constructor(source, options) {
    super(options);
    this.source = source;
    this.sheath = [];
    this.methods = {};
  }

  _write() {}

  _read(size) {}

}

class Designer {
  createMethod(protocol, name, func) {
    protocol.methods[name] = function (...args) {
      func.call(protocol, ...args);
    };
  }

  removeMethod(protocol, name) {
    delete protocol.methods[name];
  }

  enablePubSub() {}

  enableDial() {}

}

class Manager extends Designer {
  constructor() {
    super();
    this.protocols = [];
  }

  createProtocol(action, options) {
    const protocol = new Protocol();
    return this.protocols.push(protocol);
  }

  updateProtocol(id, action, options) {}

  removeProtocol(id) {}

  listProtocols() {}

}

var _default = Manager;
exports.default = _default;
//# sourceMappingURL=ProtocolBuilder.js.map