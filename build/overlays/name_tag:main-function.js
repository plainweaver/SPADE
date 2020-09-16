"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

/**
 * Makes system(...args) to call function passed.
 */
function _default(callee) {
  return function overlay(system, layers) {
    system.receptor.main = callee;
  };
}
//# sourceMappingURL=name_tag:main-function.js.map