import Promise from 'bluebird';

function Overlay() {
  this.data = layer;
  this.prev = prev.data ? prev : null;
  this.next = null;
}

export default class Overlays {
  constructor(system) {
    this.system = system;
    // todo) inner dimensional layers.
    this.layers = {};
  }

  async use(...overlays) {
    // todo) prevent manipulating same property within same layer.
    // todo) use recorder
    console.log(overlays);
    return await Promise.each(overlays, overlay =>
      overlay.call(null,
        this.system.original,
        this.layers, // overlayers
        this.system.recorder.receiver,
      )
    );
  }
}
