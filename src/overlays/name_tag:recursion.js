/**
 * Recursive sealing. Seals deeply for nested object.
 */
function rSeal(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') {
      obj[key] = rSeal(obj[key]);
    }
  });

  return Object.seal(obj);
}


class Focus {
  constructor(systemName, data) {
    this.origin = Object.freeze({
      system: systemName,
      data: data,
    });

    this.result = rSeal({
      shard: {
        processed: false,
      },
      particle: {
        processed: false,
        register: null,
      },
      action: {
        processed: false,
        evaluate: null,
        analyze: null,
      },
      domain: {
        processed: false,
        qualify: null,
      },
      event: {
        processed: false,
      },
    });

    return Object.seal(this);
  }
}

export default function recursion (original, layers, receiver) {
  receiver.particle.on('register', original.action.process);
  receiver.particle.on('register', original.domain.process);
  receiver.action.on('evaluate', original.event.process);
  receiver.action.on('analyze', original.event.process);
  receiver.domain.on('qualify', original.event.process);
  receiver.event.on('emission', original.particle.process);

  // this.overlays.layers.recursion = this;
}
