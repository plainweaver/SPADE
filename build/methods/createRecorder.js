"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRecorder;

var _flatted = _interopRequireDefault(require("flatted"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createRecorder() {
  return new Proxy(this, {
    set(target, property, value, receiver) {
      target.recorder.history.push(['set', property, (0, _flatted.default)(value)]);
      return Reflect.set(...arguments);
    },

    setPrototypeOf(target, prototype) {
      target.recorder.history.push(['setPrototypeOf', (0, _flatted.default)(prototype)]);
      return Reflect.setPrototypeOf(...arguments);
    },

    defineProperty(target, key, descriptor) {
      target.recorder.history.push(['defineProperty', key, (0, _flatted.default)(descriptor)]);
      return Reflect.defineProperty(...arguments);
    },

    deleteProperty(target, property) {
      target.recorder.history.push(['deleteProperty', property]);
      return Reflect.deleteProperty(...arguments);
    },

    get(target, property, receiver) {
      if (property === 'recorder') return undefined;
      return Reflect.get(...arguments);
    },

    getOwnPropertyDescriptor(target, property) {
      if (property === 'recorder') return undefined;
      return Reflect.getOwnPropertyDescriptor(...arguments);
    }

  });
}

;
//# sourceMappingURL=createRecorder.js.map