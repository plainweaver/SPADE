import { stringify } from 'flatted';

// not listed on below will be filtered out from the system.
const elements = ['shard', 'particle', 'action', 'domain', 'event'];

function toStorable(value) {
  if (typeof value === 'function') return value.toString();
  return stringify(value)
}

export default class Recorder {
  constructor(system) {
    this.system = { ...system };
    this.history = [];
    this.receiver = this.createProxy(this);
  }

  createProxy(recorder) {
    return new Proxy(recorder.system, {
      set(target, property, value, receiver) {
        if (value)
        recorder.history.push(['set', property, toStorable(value)]);
        return Reflect.set(...arguments);
      },
      setPrototypeOf(target, prototype) {
        recorder.history.push(['setPrototypeOf', toStorable(prototype)]);
        return Reflect.setPrototypeOf(...arguments);
      },
      defineProperty(target, key, descriptor) {
        recorder.history.push(['defineProperty', key, toStorable(descriptor)]);
        return Reflect.defineProperty(...arguments);
      },
      deleteProperty(target, property) {
        recorder.history.push(['deleteProperty', property]);
        return Reflect.deleteProperty(...arguments);
      },
      get(target, property, receiver) {
        if (elements.includes(property)) {
          return Reflect.get(...arguments);
        }
      },
      getOwnPropertyDescriptor(target, property) {
        if (elements.includes(property)){
          return Reflect.getOwnPropertyDescriptor(...arguments);
        }
      }
    });
  }
}
