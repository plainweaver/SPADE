"use strict";

const callerMap = {};

function getCaller(error) {
  if (error && error.stack) {
    const lines = error.stack.split('\n');

    if (lines.length > 2) {
      let match = lines[2].match(/at ([a-zA-Z\-_$.]+) (.*)/);

      if (match) {
        return {
          name: match[1].replace(/^Proxy\./, ''),
          file: match[2]
        };
      } else {
        match = lines[2].match(/at (.*)/);

        if (match) {
          return {
            name: 'unknown',
            file: match[1]
          };
        }
      }
    }
  }

  return {
    name: 'unknown',
    file: ''
  };
}

function getFunctionName(fn, context) {
  let contextName = '';

  if (typeof context === 'function') {
    contextName = `{context.name}.`;
  } else if (context && context.constructor && context.constructor.name !== 'Object') {
    contextName = `${context.constructor.name}.`;
  }

  return `${contextName}${fn.name}`;
}

function trackFunctionCall(options = {}) {
  return function (target, thisArg, argumentsList) {
    const {
      trackTime,
      trackCaller,
      trackCount,
      stdout,
      filter
    } = options;
    const error = trackCaller && new Error();
    const caller = getCaller(error);
    const name = getFunctionName(target, thisArg);

    if (trackCount) {
      if (!callerMap[name]) {
        callerMap[name] = 1;
      } else {
        callerMap[name]++;
      }
    }

    let start, end;

    if (trackTime) {
      start = Date.now();
    }

    const retVal = target.apply(thisArg, argumentsList);

    if (trackTime) {
      end = Date.now();
    }

    let output = `${name} was called`;

    if (trackCaller) {
      output += ` by ${caller.name}`;
    }

    if (trackCount) {
      output += ` for the ${callerMap[name]} time`;
    }

    if (trackTime) {
      output += ` and took ${end - start} mils.`;
    }

    let canReport = true;

    if (filter) {
      canReport = filter({
        type: 'function',
        name,
        caller,
        count: callerMap[name],
        time: end - start
      });
    }

    if (canReport) {
      if (stdout) {
        stdout(output);
      } else {
        console.log(output);
      }
    }

    return retVal;
  };
}

function trackPropertySet(options = {}) {
  return function set(target, prop, value, receiver) {
    const {
      trackCaller,
      trackCount,
      stdout,
      filter
    } = options;
    const error = trackCaller && new Error();
    const caller = getCaller(error);
    const contextName = target.constructor.name === 'Object' ? '' : `${target.constructor.name}.`;
    const name = `${contextName}${prop}`;
    const hashKey = `set_${name}`;

    if (trackCount) {
      if (!callerMap[hashKey]) {
        callerMap[hashKey] = 1;
      } else {
        callerMap[hashKey]++;
      }
    }

    let output = `${name} is being set`;

    if (trackCaller) {
      output += ` by ${caller.name}`;
    }

    if (trackCount) {
      output += ` for the ${callerMap[hashKey]} time`;
    }

    let canReport = true;

    if (filter) {
      canReport = filter({
        type: 'get',
        prop,
        name,
        caller,
        count: callerMap[hashKey],
        value
      });
    }

    if (canReport) {
      if (stdout) {
        stdout(output);
      } else {
        console.log(output);
      }
    }

    return Reflect.set(target, prop, value, receiver);
  };
}

function trackPropertyGet(options = {}) {
  return function get(target, prop, receiver) {
    const {
      trackCaller,
      trackCount,
      stdout,
      filter
    } = options;

    if (typeof target[prop] === 'function' || prop === 'prototype') {
      return target[prop];
    }

    const error = trackCaller && new Error();
    const caller = getCaller(error);
    const contextName = target.constructor.name === 'Object' ? '' : `${target.constructor.name}.`;
    const name = `${contextName}${prop}`;
    const hashKey = `get_${name}`;

    if (trackCount) {
      if (!callerMap[hashKey]) {
        callerMap[hashKey] = 1;
      } else {
        callerMap[hashKey]++;
      }
    }

    let output = `${name} is being get`;

    if (trackCaller) {
      output += ` by ${caller.name}`;
    }

    if (trackCount) {
      output += ` for the ${callerMap[hashKey]} time`;
    }

    let canReport = true;

    if (filter) {
      canReport = filter({
        type: 'get',
        prop,
        name,
        caller,
        count: callerMap[hashKey]
      });
    }

    if (canReport) {
      if (stdout) {
        stdout(output);
      } else {
        console.log(output);
      }
    }

    return target[prop];
  };
}

function proxyFunctions(trackedEntity, options) {
  if (typeof trackedEntity === 'function') return;
  Object.getOwnPropertyNames(trackedEntity).forEach(name => {
    if (typeof trackedEntity[name] === 'function') {
      trackedEntity[name] = new Proxy(trackedEntity[name], {
        apply: trackFunctionCall(options)
      });
    }
  });
}

function trackObject(obj, options = {}) {
  const {
    trackFunctions,
    trackProps
  } = options;
  let resultObj = obj;

  if (trackFunctions) {
    proxyFunctions(resultObj, options);
  }

  if (trackProps) {
    resultObj = new Proxy(resultObj, {
      get: trackPropertyGet(options),
      set: trackPropertySet(options),
      defineProperty: (target, key, desc) => {
        console.log('asdf');
        Reflect.defineProperty(target, key, desc);
      },
      setPrototypeOf: (target, prototype) => {
        console.log('asdf');
        Reflect.setPrototypeOf(target, prototype);
      },
      apply: trackFunctionCall(options),
      call: trackFunctionCall(options)
    });
  }

  return resultObj;
}

const defaultOptions = {
  trackFunctions: true,
  trackProps: true,
  trackTime: true,
  trackCaller: true,
  trackCount: true,
  filter: null
};

function trackClass(cls, options = {}) {
  cls.prototype = trackObject(cls.prototype, options);
  cls.prototype.constructor = cls;
  return new Proxy(cls, {
    construct(target, args) {
      const obj = new target(...args);
      return new Proxy(obj, {
        get: trackPropertyGet(options),
        set: trackPropertySet(options),

        defineProperty(target, key, desc) {
          console.log('asdf');
          Reflect.defineProperty(target, key, desc);
        },

        setPrototypeOf(target, prototype) {
          console.log('asdf');
          Reflect.setPrototypeOf(target, prototype);
        },

        apply: trackFunctionCall(options),
        call: trackFunctionCall(options)
      });
    },

    apply: trackFunctionCall(options)
  });
}

module.exports = function proxyTrack(entity, options = defaultOptions) {
  if (typeof entity === 'function') return trackClass(entity, options);
  return trackObject(entity, options);
};
//# sourceMappingURL=proxy-track.js.map