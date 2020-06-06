/**
 * Makes function support both styles, callback and promise.
 */

const promise = Symbol('promise attached to callback');

export function createCallback (customCallback) {
  let resolve;
  let reject;

  const callback = function callback (err, ...results) {
    if (err) reject(err);
    else resolve(...results)
  };

  if (customCallback) {
    callback[promise] = new Promise((res, rej) => {
      resolve = (...result) => {
        res();
        if (result.length > 0) customCallback(null, ...result);
        else customCallback();
      };
      reject = (error) => {
        rej();
        customCallback(error);
      }
    })
  } else {
    callback[promise] = new Promise(function (res, rej) {
      resolve = res;
      reject = rej;
    });
  }

  return callback;
}

function defaultCallbackFinder(...args) {
  const callback = args.pop();
  return typeof callback === 'function' ? callback : createCallback();
}

export function returnPromise(optionalArgumentsHandler, callbackStyleFunction) {
  return function (...args) {
    let callback;

    if (callbackStyleFunction) {
      switch (typeof optionalArgumentsHandler) {
        case 'function':
          callback = createCallback(optionalArgumentsHandler(...args));
          break;
        case 'number':
          if (args.length > optionalArgumentsHandler) callback = createCallback(args.pop());
          else callback = createCallback();
      }
    } else {
      callback = defaultCallbackFinder(...args);
      callbackStyleFunction = optionalArgumentsHandler;
    }

    if (this !== undefined) callbackStyleFunction = callbackStyleFunction.bind(this);

    // promise will be returned when callbackStyleFunction is already a versatile function.
    // in this case, rejection from promise should be ignored, to not print warning messages in console.
    // callback taking error would do the work.
    const isVersatile = callbackStyleFunction(...args, callback);
    if (isVersatile) isVersatile.catch(e => {});

    return callback[promise];
  }
}

export function appendCallback(optionalArgumentsHandler, promiseReturningFunction) {
  return function (...args) {
    let callback;
    let mainFunc;

    if (promiseReturningFunction) {
      if (typeof optionalArgumentsHandler === 'function') callback = optionalArgumentsHandler(...args);
      if (!callback[promise]) callback = createCallback(callback);
      mainFunc = promiseReturningFunction;
    } else {
      callback = defaultCallbackFinder(...args);
      mainFunc = optionalArgumentsHandler;
    }

    if (this !== undefined) mainFunc = mainFunc.bind(this);

    mainFunc(...args)
      .then((...result) => callback(null, ...result))
      .catch(error => callback(error));

    return callback[promise];
  };
}
