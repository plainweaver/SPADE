import js from 'jscodeshift';

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

export default function findModuleExports(ast) {
  const exportingPaths = [];

  /* export default */
  ast.find(js.ExportDefaultDeclaration).each(p => { exportingPaths.push(p); });

  /* module.exports = */
  ast.find(js.ExpressionStatement, {
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
  }).each(p => { exportingPaths.push(p); });

  function processAssignment() {

  };

  // prevents defining exports dynamically in function body
  exportingPaths.forEach(path => {
    if (path.parent.node.type !== 'Program') {
      throw new Error('exporting statement must not be placed in middle of function.');
    }
  });

  // sorts from the front range to latest range
  const sortedExports = exportingPaths
    .map((path, index) => ({ index, range: path.range }))
    .sort((a, b) => a.range[0] < b.range[0] ? -1 : 1 )
    .map(({ index }) => exportingPaths[index]);

  return sortedExports.reduce((result, path) => {
    if (path.type === 'ExportDefaultDeclaration') {
      result.default = js.expressionStatement(path.value.declaration);
    }

    return result;
  }, {});
}
