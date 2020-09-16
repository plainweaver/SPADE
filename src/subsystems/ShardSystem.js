import classes from 'extends-classes';
import { EventEmitter } from 'events';
import Transport from './principle/TransportBuilder';
import Protocol from './principle/ProtocolBuilder';
import Permission from './principle/Permission';

// endpoint IR, building protocol particles -> world
// access-control, role-oriented, very declarative
// connects with various other hardwares
export default class ShardSystem extends classes (EventEmitter, Transport, Protocol, Permission) {
  constructor(self) {
    super();

    this.transports = [];
    this.protocols = [];

    this.representations = {};

    process.nextTick(() => {
      this.particle = self.particle;
      this.action = self.action;
      this.domain = self.domain;
      this.event = self.event;
    });
  }

  // function determines boundary of group that consists of particle, action and domain.
  /**
   * @param name - name of determiner
   * @param func - callable function
   */
  represent(abstractId) {
    this.representations[name] = func;
  }

  s(name) {
    delete this.mapping[name];
  }

  // check if emitted data is valuable enough to do something with connected shards.
  process(data, info) {
    //
    if () {}
    this.particle(data);
  }

  // name
  async call(name) {

  }
}
