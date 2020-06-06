/**
 * Makes system(...args) to call function passed.
 */
export default function (callee) {
  return function overlay(system, layers) {
    system.receptor.main = callee;
  }
}
