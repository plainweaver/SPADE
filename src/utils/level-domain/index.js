// name with adjective (part of bigger part) (sum after)
// name without adjective
//  - outside of any adjectives but within the set.

// get all data
// get all data, only in subsets
// get all data, outside of subsets

// todo) Same name, but different id.
import vm from 'vm';
import _ from 'lodash';
import Promise from 'bluebird';
import sublevel from 'subleveldown';
import esprima from 'esprima';
import levelgraph from 'levelgraph';
import indexed from '../level-second-index';
import ActionSystemConnector from './ASC';
import ParticleSystemConnector from './PSC';
import { returnPromise, appendCallback } from '../versatile-function';
import { ExecutableDomain, StorableDomain } from './Domain';

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
    return new LevelDomain(db, options)
  }

  this.store = {
// --- Basic Mandatory Stores ---
    // Domain creation info
    //  - stores indexedObject { domain_name }
    domain: indexed(sublevel(db, 'domain'), { primaryIndex: null }),
    // Discriminators
    //  - stores indexedObject { domain_id, action_id }
    action: new ActionSystemConnector(),
    // Entities
    //  - stores indexedObject { domain_id, particle_id }
    particle: new ParticleSystemConnector(),

    // --- Additional Indexed Infos ---
    // todo) should we make this as plugins
    // like special useful relations
    // 1. Truely on previous set -> should check smaller set below -> save on only latest points.
    //  - takes indexedObject
    // subsetrel: index(sublevel(db, 'subrel')),
    // 2. More than one are true (AND) -> being new set is qualified
    // (circular subsetting?)
    // 3. (etc OR XOR Cycles...)
  };

  // Enqueues queries. becomes object and parallel after load.
  this.queue = [];
  // Activated domains. Immediately executable.
  this.active = {};
  // To be turned to true after load all domains into active.
  this.loaded = false;
}

LevelDomain.prototype.getAllDomains = async function() {
  const cells = await this.store.cell.getAll();
  return cells.map(info => new StorableDomain(info)).map(domain => domain.toExecutable());
};

LevelDomain.prototype.getDomains = async function(queryObject) {
  const cells = await this.store.cell.getByQueryObject(queryObject);
  return cells.map(info => new StorableDomain(info)).map(domain => domain.toExecutable());
};

LevelDomain.prototype.processParticle = async function(particle) {
  const domains = await this.getAllDomains();
  const suited = await Promise.filter(domains, domain => domain.dscr(particle));
  await Promise.map(suited, domain => this.store.rels.putIndexedObject({ cell_id: domain.id, particle_id: particle.id }));
  return suited;
};

/**
 * @param queryObject queryObject that finds domain cell.
 */
LevelDomain.prototype.getParticles = async function(queryObject) {
  const cells = await this.store.cell.getByQueryObject(queryObject);
  const result = [];
  await Promise.each(cells, async domain => {
    const rels = await this.store.rels.getByQueryObject({ cell_id: domain.id });
    rels.forEach(rel => result.push(rel.particle_id));
  });

  return _.uniq(result);
};

// dscrModuleType ['default = executableFunction', 'singleFunction', 'moduleExport', 'bodyAndArgs']
LevelDomain.prototype.createDomain = appendCallback(async function({ domainName, dscrCode, dscrType }) {
  if (typeof dscrCode === 'function') {
    if (dscrType !== undefined || dscrType === 'executableFunction')
      throw new Error("When dscr is an executable function, dscrType should be either omitted or 'executableFunction'.");

    const domain = new ExecutableDomain(domainName, dscrCode);
    console.log(domain.toStorable());
    await this.store.cell.putIndexedObject(domain.toStorable());
    return domain;
  }

  else if (dscrType === 'moduleExport'){
    const ast = esprima.parseModule(dscrCode);

  }
});

LevelDomain.prototype.deleteDomain = appendCallback(async function (queryObject) {
  const domains = await this.store.cell.getByQueryObject(queryObject);
  await Promise.all(domains.map(cell => this.store.rels.delByQueryObject({ cell_id: cell.id })));
  await this.store.cell.delByQueryObject(queryObject);
  return domains;
});

export default LevelDomain;
