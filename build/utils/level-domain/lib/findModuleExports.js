"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findModuleExports;

var _jscodeshift = _interopRequireDefault(require("jscodeshift"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * supported) export default
 * supported) module.exports =
 * todo) module['exports'] =
 * todo) module = { exports: {}, ...module }
 * todo) exports =
 * todo) exports.property
 * todo) exports['property']
 *
 * does not allow middle
 */
function findModuleExports(ast) {
  const exportingPaths = [];
  /* export default */

  ast.find(_jscodeshift.default.ExportDefaultDeclaration).each(p => {
    exportingPaths.push(p);
  });
  /* module.exports = */

  ast.find(_jscodeshift.default.ExpressionStatement, {
    expression: {
      left: {
        object: {
          name: 'module'
        },
        property: {
          name: 'exports'
        }
      }
    }
  }).each(p => {
    exportingPaths.push(p);
  });

  function processAssignment() {}

  ; // prevents defining exports dynamically in function body

  exportingPaths.forEach(path => {
    if (path.parent.node.type !== 'Program') {
      throw new Error('exporting statement must not be placed in middle of function.');
    }
  }); // sorts from the front range to latest range

  const sortedExports = exportingPaths.map((path, index) => ({
    index,
    range: path.range
  })).sort((a, b) => a.range[0] < b.range[0] ? -1 : 1).map(({
    index
  }) => exportingPaths[index]);
  return sortedExports.reduce((result, path) => {
    if (path.type === 'ExportDefaultDeclaration') {
      result.default = _jscodeshift.default.expressionStatement(path.value.declaration);
    }

    return result;
  }, {});
}
//# sourceMappingURL=findModuleExports.js.map