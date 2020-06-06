import fs from 'fs';
import levelup from 'levelup';
import rocksdb from 'rocksdb';
import object from '../utils/level-object';
import subset from '../../utils/level-subset/index';
import domain from '../../utils/level-domain/index';
import autokey from '../utils/level-auto-inc/autokey';
import cam from '../../utils/level-cam';

const options = {
  deferredOpen: true,
  openCallback: true,
  createIfMissing: true,
};

export default {
  forEtc: storageForEtc,
  forParticles: storageForParticles,
  forDomains: storageForDomains,
  forLogs: storageForLogs,
};

function storageForEtc(self) {
  const config = self.config.storage;
  return levelup(rocksdb(config.location.storageForEtc));
}

function storageForParticles(self) {
  const config = self.config.storage;
  const { createKey } = autokey(self.storageForEtc, { counterName: config.counter.forCells });

  return cam({
    storage: levelup(rocksdb(config.location.storageForCells)),
    generateAddress: createKey,
  })
}

function storageForDomains(self) {
  const config = self.config.storage;
  const relationdb = levelup(rocksdb(config.location.storageForTypes + '/relations'));
  const typecelldb = object(levelup(rocksdb(config.location.storageForTypes + '/cells')), [ 'id', 'name' ]);

  const { createKey } = autokey(self.storageForEtc, { counterName: config.counter.forTypes });

  return domain(subset(typecelldb, relationdb, createKey));
}

function storageForLogs(self) {
  const config = self.config.storage;
  const createDatabase = path => levelup(rocksdb(path));

  if (!fs.existsSync(config.location.storageForLogs)) {
    fs.mkdirSync(config.location.storageForLogs);
  }

  const storageForCounter = self.storageForEtc;

  const dbs = [
    createDatabase(config.location.storageForLogs + '/emission'),
    createDatabase(config.location.storageForLogs + '/resolution'),
    createDatabase(config.location.storageForLogs + '/rejection'),
  ];

  return {
    emission: autokey(dbs[0], { storageForCounter, counterName: config.counter.forEmission }),
    resolution: autokey(dbs[1], { storageForCounter, counterName: config.counter.forResolution }),
    rejection: autokey(dbs[2], { storageForCounter, counterName: config.counter.forRejection }),
  };
}
