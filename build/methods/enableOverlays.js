"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function _default(overlays) {
  const systemProxy = this.createRecorder();
  return await _bluebird.default.map(overlays, p => p.call(systemProxy));
}

;
//# sourceMappingURL=enableOverlays.js.map