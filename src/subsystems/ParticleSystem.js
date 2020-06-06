import { EventEmitter } from 'events';
import levelup from 'levelup';
import memdown from 'memdown';
import rocksdb from 'rocksdb';
import sublevel from 'subleveldown';
import array from '../../utils/level-array';
import cache from '../../utils/level-sync-cache';

export default class ParticleSystem extends EventEmitter {
  constructor(self) {
    super();

    // all the temporal values to be pointed
    this.lightStore = levelup(memdown());
    // all the persistent values to be pointed
    this.heavyStore = levelup(rocksdb('./'));

    // waiting list of processes
    this.sequence = array(sublevel(this.lightStore, 0));
    // marked variables used in current process
    this.processor = sublevel(this.lightStore, 1);
    // marked variables used in action execution
    this.execution = cache(this.lightStore, this.heavyStore, 2);

    // for action, domain, event system.
    this.abstract = sublevel(this.heavyStore, 3);
    // for event system.
    this.shape = cache(sublevel(this.heavyStore, 4));

    process.nextTick(() => {
      this.shard = self.shard;
      this.particle = self.particle;
      this.action = self.action;
      this.domain = self.domain;
    });
  }

  listPriorities() {

  }

  getStorages() {

  }

  createStorage() {

  }

  removeStorage() {

  }

  putInClosure() {

  }

  delFromClosure() {

  }

  process(buffer) {

  }

  grantStorage(usageInfo) {
    const simpleGrant = () => {
      return this[usageInfo];
    };

    return simpleGrant(usageInfo);
  }
}
