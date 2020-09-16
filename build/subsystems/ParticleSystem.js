"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

var _levelup = _interopRequireDefault(require("levelup"));

var _memdown = _interopRequireDefault(require("memdown"));

var _rocksdb = _interopRequireDefault(require("rocksdb"));

var _subleveldown = _interopRequireDefault(require("subleveldown"));

var _levelArray = _interopRequireDefault(require("../../utils/level-array"));

var _levelSyncCache = _interopRequireDefault(require("../../utils/level-sync-cache"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ParticleSystem extends _events.EventEmitter {
  constructor(self) {
    super(); // all the temporal values to be pointed

    this.lightStore = (0, _levelup.default)((0, _memdown.default)()); // all the persistent values to be pointed

    this.heavyStore = (0, _levelup.default)((0, _rocksdb.default)('./')); // waiting list of processes

    this.sequence = (0, _levelArray.default)((0, _subleveldown.default)(this.lightStore, 0)); // marked variables used in current process

    this.processor = (0, _subleveldown.default)(this.lightStore, 1); // marked variables used in action execution

    this.execution = (0, _levelSyncCache.default)(this.lightStore, this.heavyStore, 2); // for action, domain, event system.

    this.abstract = (0, _subleveldown.default)(this.heavyStore, 3); // for event system.

    this.shape = (0, _levelSyncCache.default)((0, _subleveldown.default)(this.heavyStore, 4));
    process.nextTick(() => {
      this.shard = self.shard;
      this.particle = self.particle;
      this.action = self.action;
      this.domain = self.domain;
    });
  }

  listPriorities() {}

  getStorages() {}

  createStorage() {}

  removeStorage() {}

  putInClosure() {}

  delFromClosure() {}

  process(buffer) {}

  grantStorage(usageInfo) {
    const simpleGrant = () => {
      return this[usageInfo];
    };

    return simpleGrant(usageInfo);
  }

}

exports.default = ParticleSystem;
//# sourceMappingURL=ParticleSystem.js.map