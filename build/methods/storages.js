"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _levelup = _interopRequireDefault(require("levelup"));

var _rocksdb = _interopRequireDefault(require("rocksdb"));

var _levelObject = _interopRequireDefault(require("../utils/level-object"));

var _index = _interopRequireDefault(require("../../utils/level-subset/index"));

var _index2 = _interopRequireDefault(require("../../utils/level-domain/index"));

var _autokey = _interopRequireDefault(require("../utils/level-auto-inc/autokey"));

var _levelCam = _interopRequireDefault(require("../../utils/level-cam"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const options = {
  deferredOpen: true,
  openCallback: true,
  createIfMissing: true
};
var _default = {
  forEtc: storageForEtc,
  forParticles: storageForParticles,
  forDomains: storageForDomains,
  forLogs: storageForLogs
};
exports.default = _default;

function storageForEtc(self) {
  const config = self.config.storage;
  return (0, _levelup.default)((0, _rocksdb.default)(config.location.storageForEtc));
}

function storageForParticles(self) {
  const config = self.config.storage;
  const {
    createKey
  } = (0, _autokey.default)(self.storageForEtc, {
    counterName: config.counter.forCells
  });
  return (0, _levelCam.default)({
    storage: (0, _levelup.default)((0, _rocksdb.default)(config.location.storageForCells)),
    generateAddress: createKey
  });
}

function storageForDomains(self) {
  const config = self.config.storage;
  const relationdb = (0, _levelup.default)((0, _rocksdb.default)(config.location.storageForTypes + '/relations'));
  const typecelldb = (0, _levelObject.default)((0, _levelup.default)((0, _rocksdb.default)(config.location.storageForTypes + '/cells')), ['id', 'name']);
  const {
    createKey
  } = (0, _autokey.default)(self.storageForEtc, {
    counterName: config.counter.forTypes
  });
  return (0, _index2.default)((0, _index.default)(typecelldb, relationdb, createKey));
}

function storageForLogs(self) {
  const config = self.config.storage;

  const createDatabase = path => (0, _levelup.default)((0, _rocksdb.default)(path));

  if (!_fs.default.existsSync(config.location.storageForLogs)) {
    _fs.default.mkdirSync(config.location.storageForLogs);
  }

  const storageForCounter = self.storageForEtc;
  const dbs = [createDatabase(config.location.storageForLogs + '/emission'), createDatabase(config.location.storageForLogs + '/resolution'), createDatabase(config.location.storageForLogs + '/rejection')];
  return {
    emission: (0, _autokey.default)(dbs[0], {
      storageForCounter,
      counterName: config.counter.forEmission
    }),
    resolution: (0, _autokey.default)(dbs[1], {
      storageForCounter,
      counterName: config.counter.forResolution
    }),
    rejection: (0, _autokey.default)(dbs[2], {
      storageForCounter,
      counterName: config.counter.forRejection
    })
  };
}
//# sourceMappingURL=storages.js.map