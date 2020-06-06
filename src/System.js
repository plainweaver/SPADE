import Shard from './subsystems/ShardSystem';
import Particle from './subsystems/ParticleSystem';
import Action from './subsystems/ActionSystem';
import Domain from './subsystems/DomainSystem';
import Event from './subsystems/EventSystem';
import Recorder from './Recorder';
import Overlays from './Overlays';
import Receptor from './Receptor';

/**
 * to execute: emit from event system
 */
class System {
  constructor(config) {
    this.config = config;

    this.shard = new Shard(this);
    this.particle = new Particle(this);
    this.action = new Action(this);
    this.domain = new Domain(this);
    this.event = new Event(this);

    this.original = Object.freeze({ ...this });
    this.recorder = new Recorder(this);
    this.overlays = new Overlays(this);
    this.receptor = new Receptor(this);
  }

  /* -- shortcuts below -- */

  /**
   * Applies overlays on the system.
   */
  use(...overlays) {
    return this.overlays.use(...overlays);
  }

  /**
   * Sets main function of the system.
   */
  set main(method) {
    if (typeof method === 'function') {
      this.receptor.main = method;
    }
  }
}

export default System;
