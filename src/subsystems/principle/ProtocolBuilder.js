import { Transform } from 'stream';

class Protocol extends Transform {
  constructor(source, options) {
    super(options);
    this.source = source;
    this.sheath = [];
    this.methods = {};
  }

  _write() {

  }

  _read(size) {

  }
}

class Designer {
  createMethod(protocol, name, func) {
    protocol.methods[name] = function (...args) { func.call(protocol, ...args); }
  }

  removeMethod(protocol, name) {
    delete protocol.methods[name];
  }

  enablePubSub() {

  }

  enableDial() {

  }
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

  updateProtocol(id, action, options) {

  }

  removeProtocol(id) {

  }

  listProtocols() {

  }
}

export default Manager;
