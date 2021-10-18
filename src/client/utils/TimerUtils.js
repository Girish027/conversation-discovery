/**
 * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
 * unpublished, proprietary work which is fully protected under
 * copyright law. This code may only be used pursuant to a valid
 * license from 24/7 Customer, Inc.
 */
/**
 * TimerUtils
 * @module utils/timer-utils
 */

/**
 * requestAnimationFrame() shim by Paul Irish
 * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
const _setTimeoutProxy = (callback) => window.setTimeout(callback, 1000 / 60);

/**
 * @ref https://github.com/turuslan/HackTimer/blob/master/LICENSE
 */
let worker;
let lastFakeId = 0;
function _getFakeId(maxFakeId, fakeIdToCallback) {
  do {
    if (lastFakeId === maxFakeId) {
      lastFakeId = 0;
    } else {
      lastFakeId += 1;
    }
  } while (Object.prototype.hasOwnProperty.call(fakeIdToCallback, lastFakeId));
  return lastFakeId;
}

const _getRequestWorker = () => {
  let retVal;

  if (window.Worker && window.Blob) {
    try {
      const fakeIdToCallback = {};
      const maxFakeId = 0x7FFFFFFF; // 2 ^ 31 - 1, 31 bit, positive values of signed 32 bit integer

      const blob = new Blob([`
        var fakeIdToId = {};
        onmessage = function (event) {
          var data = event.data,
            name = data.name,
            fakeId = data.fakeId,
            time;
          if(data.hasOwnProperty('time')) {
            time = data.time;
          }
          switch (name) {
            case 'setInterval':
              fakeIdToId[fakeId] = setInterval(function() {
                postMessage({fakeId: fakeId});
              }, time);
              break;
            case 'clearInterval':
              if (fakeIdToId.hasOwnProperty (fakeId)) {
                clearInterval(fakeIdToId[fakeId]);
                delete fakeIdToId[fakeId];
              }
              break;
            case 'setTimeout':
              fakeIdToId[fakeId] = setTimeout(function() {
                postMessage({fakeId: fakeId});
                if (fakeIdToId.hasOwnProperty (fakeId)) {
                  delete fakeIdToId[fakeId];
                }
              }, time);
              break;
            case 'clearTimeout':
              if (fakeIdToId.hasOwnProperty (fakeId)) {
                clearTimeout(fakeIdToId[fakeId]);
                delete fakeIdToId[fakeId];
              }
              break;
          }
        };
      `]);

      // Obtain a blob URL reference to our worker 'file'.
      const _workerScript = window.URL.createObjectURL(blob);
      worker = new Worker(_workerScript);

      worker.onmessage = (event) => {
        const { data } = event;
        const { fakeId } = data;
        let request;
        if (Object.prototype.hasOwnProperty.call(fakeIdToCallback, fakeId)) {
          request = fakeIdToCallback[fakeId];
          if (Object.prototype.hasOwnProperty.call(request, 'isTimeout') && request.isTimeout) {
            delete fakeIdToCallback[fakeId];
          }
        }
        if (request && (typeof (request.callback) === 'function')) {
          request.callback.apply(window, request.parameters);
        }
      };
      worker.onerror = () => {
      };

      retVal = {
        setInterval: (callback, time) => {
          const fakeId = _getFakeId(maxFakeId, fakeIdToCallback);
          fakeIdToCallback[fakeId] = {
            callback,
            /* eslint-disable no-undef */
            parameters: Array.prototype.slice.call(arguments, 2)
            /* eslint-enable no-undef */
          };
          worker.postMessage({
            name: 'setInterval',
            fakeId,
            time
          });
          return fakeId;
        },
        clearInterval: (fakeId) => {
          if (Object.prototype.hasOwnProperty.call(fakeIdToCallback, fakeId)) {
            delete fakeIdToCallback[fakeId];
            worker.postMessage({
              name: 'clearInterval',
              fakeId
            });
          }
        },
        setTimeout: (callback, time) => {
          const fakeId = _getFakeId(maxFakeId, fakeIdToCallback);
          fakeIdToCallback[fakeId] = {
            callback,
            /* eslint-disable no-undef */
            parameters: Array.prototype.slice.call(arguments, 2),
            /* eslint-enable no-undef */
            isTimeout: true
          };
          worker.postMessage({
            name: 'setTimeout',
            fakeId,
            time
          });
          return fakeId;
        },
        clearTimeout: (fakeId) => {
          if (Object.prototype.hasOwnProperty.call(fakeIdToCallback, fakeId)) {
            delete fakeIdToCallback[fakeId];
            worker.postMessage({
              name: 'clearTimeout',
              fakeId
            });
          }
        }
      };
    } catch (error) {
      // log error
    }
  }

  return retVal;
};

const _requestWorker = _getRequestWorker();

const _requestAnimFrame = (() => window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || _setTimeoutProxy
)();

/**
 * @see https://gist.github.com/joelambert/1002116
 */
class TimerUtils {
  /**
   * Behaves the same as setInterval except uses requestAnimationFrame() where possible for better performance
   * @param {function} fn The callback function
   * @param {int} delay The delay in milliseconds
   */
  static requestInterval(fn, delay) {
    if (_requestWorker) {
      return _requestWorker.setInterval(fn, delay);
    }

    if (!window.requestAnimationFrame
      && !window.webkitRequestAnimationFrame
      && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) // Firefox 5 ships without cancel support
      && !window.oRequestAnimationFrame
      && !window.msRequestAnimationFrame) {
      return window.setInterval(fn, delay);
    }

    let start = new Date().getTime();
    const handle = {};

    const loop = () => {
      const current = new Date().getTime();
      const delta = current - start;

      if (delta >= delay) {
        fn.call();
        start = new Date().getTime();
      }

      handle.value = _requestAnimFrame(loop);
    };

    handle.value = _requestAnimFrame(loop);
    return handle;
  }

  /**
   * Behaves the same as clearInterval except uses cancelRequestAnimationFrame() where possible for better performance
   * @param {int|object} fn The callback function
   */
  static clearRequestInterval(handle) {
    if (_requestWorker) {
      _requestWorker.clearInterval(handle);
    } else if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(handle.value);
    } else if (window.webkitCancelAnimationFrame) {
      window.webkitCancelAnimationFrame(handle.value);
    } else if (window.webkitCancelRequestAnimationFrame) {
      window.webkitCancelRequestAnimationFrame(handle.value);
    } else if (window.mozCancelRequestAnimationFrame) {
      /* Support for legacy API */
      window.mozCancelRequestAnimationFrame(handle.value);
    } else if (window.oCancelRequestAnimationFrame) {
      window.oCancelRequestAnimationFrame(handle.value);
    } else if (window.msCancelRequestAnimationFrame) {
      window.msCancelRequestAnimationFrame(handle.value);
    } else {
      window.clearInterval(handle);
    }
  }


  /**
   * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
   * @param {function} fn The callback function
   * @param {int} delay The delay in milliseconds
   */
  static requestTimeout(fn, delay = 10) {
    if (_requestWorker) {
      return _requestWorker.setTimeout(fn, delay);
    }

    if (!window.requestAnimationFrame
      && !window.webkitRequestAnimationFrame
      && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) // Firefox 5 ships without cancel support
      && !window.oRequestAnimationFrame
      && !window.msRequestAnimationFrame) {
      return window.setTimeout(fn, delay);
    }

    const start = new Date().getTime();
    const handle = {};

    const loop = () => {
      const current = new Date().getTime();
      const delta = current - start;

      if (delta >= delay) {
        fn.call();
      } else {
        handle.value = _requestAnimFrame(loop);
      }
    };

    handle.value = _requestAnimFrame(loop);
    return handle;
  }

  /**
   * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
   * @param {int|object} fn The callback function
   */
  static clearRequestTimeout(handle) {
    if (_requestWorker) {
      _requestWorker.clearTimeout(handle);
    } else if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(handle.value);
    } else if (window.webkitCancelAnimationFrame) {
      window.webkitCancelAnimationFrame(handle.value);
    } else if (window.webkitCancelRequestAnimationFrame) {
      window.webkitCancelRequestAnimationFrame(handle.value);
    } else if (window.mozCancelRequestAnimationFrame) {
      /* Support for legacy API */
      window.mozCancelRequestAnimationFrame(handle.value);
    } else if (window.oCancelRequestAnimationFrame) {
      window.oCancelRequestAnimationFrame(handle.value);
    } else if (window.msCancelRequestAnimationFrame) {
      window.msCancelRequestAnimationFrame(handle.value);
    } else {
      window.clearTimeout(handle);
    }
  }
}

export default TimerUtils;
