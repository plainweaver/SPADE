import promisify from '../utils/promisify';

function findMethod(system, paths) {
  let scope = system;
  if (paths.length === 0) return system.receptor.main;

  const method = paths.reduce((acc, cur) => {
    scope = acc;
    return acc[cur];
  }, scope);
  if (!method) throw new Error(`Unable to get a method '${paths.join('.')}'.`);

  return method.bind(scope);
}

// to use async things just like sync ones.
// enables this by intercept getter setter caller in the middle and enqueues them.
// if a result of segment returns 'this' self, then it is chainable.

/**
 * @param options.main {Function} - function for when the system itself gets executed.
 * @param options.helpers {Object<Function>>} -
 */
export default class Receptor {
  constructor(system, options = {}) {
    // queues for jobs
    this.paths = [];
    this.execs = [];
    this.exits = [];
    this.processing = false;

    // to wire system's circular references.
    this.createProcess(() => new Promise(setImmediate));

    this.system = system;
    this.main = options.main;
    this.keepingPaths = false;

    return async handler => {
      handler.call(null, this.createReceiver());
      return new Promise(resolve => this.exits.push(resolve));
    };
  }

  /**
   * Returns proxy that will act like system itself by handling get, call, etc...
   * Not only intercepting them, but also record them in queue to process lazily.
   * In result, it is possible to write and use async jobs just like a sync one.
   *   example) you can write `system.use(async).use(async).listen(3000)`.
   */
  createReceiver() {
    const receptor = this;
    const proxy = new Proxy(function() {}, {
      // -- enqueues jobs, returns sync proxy again for the moment --
      get(target, property, receiver) {
        receptor.paths.push(property);
        return proxy;
      },
      apply(target, thisArg, argsList) {
        const paths = [ ...receptor.paths ];
        if (!receptor.keepingPaths) receptor.clearPaths();

        receptor.createProcess(async () => {
          const method = findMethod(receptor.system, paths);
          await method(...argsList);
        });

        return proxy;
      },

      // -- returns promise that resolves after queued jobs are cleared --
      async getPrototypeOf() {

      },
      async ownKeys(target) {
        return Reflect.ownKeys(receptor.system);
      },

      // -- prevents direct manipulation and suggest using overlays. --
      set(target, property, value, receiver) {
        const proto = Object.getPrototypeOf(receptor.system);
        const descs = Object.getOwnPropertyDescriptors(proto);
        const setters = Object.keys(descs).filter(name => descs[name].set);

        if (setters.includes(property)) {
          descs[property].set(value);
          return true;
        }

        throw new Error(
          "Cannot set property of system. " +
          "To manipulate system's property, use overlay regularly or define setter in System to standardize the structure."
        );
      },
      deleteProperty() {
        throw new Error(
          "Cannot delete property of system. Only overlays can delete property."
        );
      }
    });

    return proxy;
  }

  /**
   * Enqueues process and start iteration.
   *  - supports both styles async/await and callback.
   * @return asyncFunc's return value.
   */
  async createProcess(asyncFunc, callback) {
    let promise;

    if (!callback) {
      callback = promisify();
      promise = callback.promise;
    }

    // create and push new process
    this.execs.push(async () => {
      // do current process
      const result = await asyncFunc();
      this.execs.shift(); // remove self
      callback(null, result);

      if (this.execs.length > 0) {
        // start next process
        this.execs[0]();
      } else {
        // end of queue
        this.processing = false;
        this.exits.forEach(res => res());
      }
    });

    if (!this.processing) {
      this.processing = true;
      this.execs[0]();
    }

    return await promise;
  }

  /**
   * Paths won't be erased after executions.
   */
  keepPaths() {
    if (this.keepingPaths) throw new Error('The receptor is already in keeping paths.');
    this.keepingPaths = true;
  }

  /**
   * Manually erase paths.
   */
  clearPaths() {
    this.paths.splice(0, this.paths.length);
  }
}
