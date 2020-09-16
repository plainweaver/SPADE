"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tcpServer;
exports.requires = void 0;

var _net = _interopRequireDefault(require("net"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const requires = ['recursion'];
exports.requires = requires;

function tcpServer(original, layers, receiver) {
  receiver.listen = function (port) {
    console.log('start listening');
    const server = new _net.default.Server();
    server.listen(3000, () => console.log('listening'));
  }; // this.overlays.layers.tcpServer = this;

}
//# sourceMappingURL=name_tag:tcp-server.js.map