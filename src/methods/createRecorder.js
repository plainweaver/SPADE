import stringify from 'flatted';

export default function createRecorder() {
  return new Proxy(this, {
    set(target, property, value, receiver) {
      target.recorder.history.push(['set', property, stringify(value)]);
      return Reflect.set(...arguments);
    },
    setPrototypeOf(target, prototype) {
      target.recorder.history.push(['setPrototypeOf', stringify(prototype)]);
      return Reflect.setPrototypeOf(...arguments);
    },
    defineProperty(target, key, descriptor) {
      target.recorder.history.push(['defineProperty', key, stringify(descriptor)]);
      return Reflect.defineProperty(...arguments);
    },
    deleteProperty(target, property) {
      target.recorder.history.push(['deleteProperty', property]);
      return Reflect.deleteProperty(...arguments);
    },
    get(target, property, receiver) {
      if (property === 'recorder') return undefined;
      return Reflect.get(...arguments);
    },
    getOwnPropertyDescriptor(target, property) {
      if (property === 'recorder') return undefined;
      return Reflect.getOwnPropertyDescriptor(...arguments);
    }
  });
};