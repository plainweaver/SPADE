"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _promisify = _interopRequireDefault(require("./promisify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function listAllTypes(callback) {
  this.storageForTypes.search({
    subject: this.storageForTypes.v('x')
  }, (err, results) => {
    if (err) return callback(err);
    callback(results);
  });
}

var _default = (0, _promisify.default)(listAllTypes);

exports.default = _default;
//# sourceMappingURL=listAllTypes.js.map