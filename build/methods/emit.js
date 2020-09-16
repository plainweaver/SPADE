"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var listeners = _interopRequireWildcard(require("../listeners/index"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function emit(eventName, ...data) {
  let result;

  try {
    await this.storageForLogs.emission.putWithAutoKey(JSON.stringify({
      eventName: eventName,
      arguments: data,
      emitted_at: this.getDate()
    }));
    result = await listeners[eventName].call(this, ...data);
    await this.storageForLogs.resolution.putWithAutoKey(JSON.stringify({
      eventName: eventName,
      result,
      resolved_at: this.getDate()
    }));
  } catch (e) {
    console.log(e);
    await this.storageForLogs.rejection.putWithAutoKey(JSON.stringify({
      eventName: eventName,
      rejected_at: this.getDate(),
      reason: e
    }));
  }

  return result;
}

var _default = emit;
exports.default = _default;
//# sourceMappingURL=emit.js.map