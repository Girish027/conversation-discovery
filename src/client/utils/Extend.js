/**
 * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
 * unpublished, proprietary work which is fully protected under
 * copyright law. This code may only be used pursuant to a valid
 * license from 24/7 Customer, Inc.
 */

/**
 * A module that exports an extend function
 * Use this IFF jQuery and underscore are not available.
 * @module utils/extend
 * @see http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
 * Extend the target object with the given object(s),
 * ala jQuery.extend(), with deep copy support.
 * The function takes a variable argument list of Objects.
 * @function
 * @param {Object} target the target object to extend
 * @param {Object} obj... the object to use to extend the target
 */
const extend = function extend(target, ...args) {
  if (!(target !== undefined && typeof target === 'object')) {
    return target;
  }

  const _target = target;

  const argCount = args.length;
  for (let idx = 0; idx < argCount; idx += 1) {
    const obj = args[idx];
    if (obj !== undefined && typeof obj === 'object') {
      Object.keys(obj).map((prop) => {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          if (obj[prop] !== undefined
            && obj[prop].constructor
            && obj[prop].constructor === Object) {
            if (_target[prop] === undefined) {
              _target[prop] = {};
            }
            if (typeof _target[prop] !== 'object') {
              _target[prop] = obj[prop];
            } else {
              extend(_target[prop], obj[prop]);
            }
          } else if (obj[prop] && obj[prop].constructor === Array) {
            _target[prop] = obj[prop].slice(0);
          } else {
            _target[prop] = obj[prop];
          }
        }
        return 0;
      });
    }
  }
  return _target;
};

export default extend;
