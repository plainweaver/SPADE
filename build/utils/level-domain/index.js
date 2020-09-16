"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vm = _interopRequireDefault(require("vm"));

var _lodash = _interopRequireDefault(require("lodash"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _subleveldown = _interopRequireDefault(require("subleveldown"));

var _esprima = _interopRequireDefault(require("esprima"));

var _levelgraph = _interopRequireDefault(require("levelgraph"));

var _levelSecondIndex = _interopRequireDefault(require("../level-second-index"));

var _ASC = _interopRequireDefault(require("./ASC"));

var _PSC = _interopRequireDefault(require("./PSC"));

var _versatileFunction = require("../versatile-function");

var _Domain = require("./Domain");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// name with adjective (part of bigger part) (sum after)
// name without adjective
//  - outside of any adjectives but within the set.
// get all data
// get all data, only in subsets
// get all data, outside of subsets
// todo) Same name, but different id.
// For Type Checking...
// todo) should we move to 1. Typescript or 2. switch files dev(checks) <-> prod(does no check)
// 1) merge circular sets
// 2) if A-B-C-A, process until C.
// 3) if A-B-C-A, checks result from C equivalent to A. (for systems in special case that dscr changes particle)
// 4) keep circling per intervals (not recommended)
// 5) prevent circular sets (default)
// -- dscr, subset part --
// 1) discriminate by all domains as particle added (starts from every endpoints)
// 2) selective discrimination
// -- methods, functional part --
// 1) gradually expanding scope
function LevelDomain(db, options = {}) {
  if (!(this instanceof LevelDomain)) {
    return new LevelDomain(db, options);
  }

  this.store = {
    // --- Basic Mandatory Stores ---
    // Domain creation info
    //  - stores indexedObject { domain_name }
    domain: (0, _levelSecondIndex.default)((0, _subleveldown.default)(db, 'domain'), {
      primaryIndex: null
    }),
    // Discriminators
    //  - stores indexedObject { domain_id, action_id }
    action: new _ASC.default(),
    // Entities
    //  - stores indexedObject { domain_id, particle_id }
    particle: new _PSC.default() // --- Additional Indexed Infos ---
    // todo) should we make this as plugins
    // like special useful relations
    // 1. Truely on previous set -> should check smaller set below -> save on only latest points.
    //  - takes indexedObject
    // subsetrel: index(sublevel(db, 'subrel')),
    // 2. More than one are true (AND) -> being new set is qualified
    // (circular subsetting?)
    // 3. (etc OR XOR Cycles...)

  }; // Enqueues queries. becomes object and parallel after load.

  this.queue = []; // Activated domains. Immediately executable.

  this.active = {}; // To be turned to true after load all domains into active.

  this.loaded = false;
}

LevelDomain.prototype.getAllDomains = async function () {
  const cells = await this.store.cell.getAll();
  return cells.map(info => new _Domain.StorableDomain(info)).map(domain => domain.toExecutable());
};

LevelDomain.prototype.getDomains = async function (queryObject) {
  const cells = await this.store.cell.getByQueryObject(queryObject);
  return cells.map(info => new _Domain.StorableDomain(info)).map(domain => domain.toExecutable());
};

LevelDomain.prototype.processParticle = async function (particle) {
  const domains = await this.getAllDomains();
  const suited = await _bluebird.default.filter(domains, domain => domain.dscr(particle));
  await _bluebird.default.map(suited, domain => this.store.rels.putIndexedObject({
    cell_id: domain.id,
    particle_id: particle.id
  }));
  return suited;
};
/**
 * @param queryObject queryObject that finds domain cell.
 */


LevelDomain.prototype.getParticles = async function (queryObject) {
  const cells = await this.store.cell.getByQueryObject(queryObject);
  const result = [];
  await _bluebird.default.each(cells, async domain => {
    const rels = await this.store.rels.getByQueryObject({
      cell_id: domain.id
    });
    rels.forEach(rel => result.push(rel.particle_id));
  });
  return _lodash.default.uniq(result);
}; // dscrModuleType ['default = executableFunction', 'singleFunction', 'moduleExport', 'bodyAndArgs']


LevelDomain.prototype.createDomain = (0, _versatileFunction.appendCallback)(async function ({
  domainName,
  dscrCode,
  dscrType
}) {
  if (typeof dscrCode === 'function') {
    if (dscrType !== undefined || dscrType === 'executableFunction') throw new Error("When dscr is an executable function, dscrType should be either omitted or 'executableFunction'.");
    const domain = new _Domain.ExecutableDomain(domainName, dscrCode);
    console.log(domain.toStorable());
    await this.store.cell.putIndexedObject(domain.toStorable());
    return domain;
  } else if (dscrType === 'moduleExport') {
    const ast = _esprima.default.parseModule(dscrCode);
  }
});
LevelDomain.prototype.deleteDomain = (0, _versatileFunction.appendCallback)(async function (queryObject) {
  const domains = await this.store.cell.getByQueryObject(queryObject);
  await _bluebird.default.all(domains.map(cell => this.store.rels.delByQueryObject({
    cell_id: cell.id
  })));
  await this.store.cell.delByQueryObject(queryObject);
  return domains;
});
var _default = LevelDomain;
exports.default = _default;
//# sourceMappingURL=index.js.map