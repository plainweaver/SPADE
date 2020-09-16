"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Overlay() {
  this.data = layer;
  this.prev = prev.data ? prev : null;
  this.next = null;
}

class Overlays {
  constructor(system) {
    this.system = system; // todo) inner dimensional layers.

    this.layers = {};
  }

  async use(...overlays) {
    // todo) prevent manipulating same property within same layer.
    // todo) use recorder
    console.log(overlays);
    return await _bluebird.default.each(overlays, overlay => overlay.call(null, this.system.original, this.layers, // overlayers
    this.system.recorder.receiver));
  }

}

exports.default = Overlays;
//# sourceMappingURL=Overlays.js.map