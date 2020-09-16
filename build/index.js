"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.System = void 0;

var _name_tagRecursion = _interopRequireDefault(require("./overlays/name_tag:recursion"));

var _name_tagTcpServer = _interopRequireDefault(require("./overlays/name_tag:tcp-server"));

var _name_tagTcpAnalyzer = _interopRequireDefault(require("./overlays/name_tag:tcp-analyzer"));

var _name_tagTcpUtility = _interopRequireDefault(require("./overlays/name_tag:tcp-utility"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const System = require('./System').default;
/**
 * A shape of system recommended as default.
 * If you are a system builder, please modify as you want by importing from './System'.
 *
 * Hardcoded in (sub)system mean it's standardized.
 * Written here means it's in level of proposal or free to change.
 */


exports.System = System;

var _default = async function () {
  const system = new System();
  await system.receptor(receiver => {
    receiver.use(_name_tagRecursion.default);
    receiver.use(_name_tagTcpServer.default) // ≈ system.shard.createProtocol(...)
    .use((0, _name_tagTcpAnalyzer.default)({
      port: 8000
    })).use((0, _name_tagTcpUtility.default)({
      port: 9000
    }));
    receiver.main = system.shard.listen;
  });
  return await system();
}();

exports.default = _default;
//# sourceMappingURL=index.js.map