/**
 * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
 * unpublished, proprietary work which is fully protected under
 * copyright law. This code may only be used pursuant to a valid
 * license from 24/7 Customer, Inc.
 */

/**
 * Assertions module
 * @module helpers/assert
 */

const RX_EMPTY = /^\s*$/;

/**
 * Callback invoked when an assertion fails.
 * The default implementation throws an exception that includes a message describing the failed assertion.
 * @func _onFailure
 * @private
 * @memberOf module:helpers/assert
 * @param {String} msg Message to be shown when exception is thrown
 */
function onFailure(msg) {
  throw new Error(msg);
}

class Assert {
  /**
   * Assert a condition and throw an error if the condition is equivalent to `false`.
   * @func assert
   * @public
   * @memberOf module:helpers/assert
   * @param {Boolean} cond A condition to evaluate.
   * @param {String} [msg] The error message to throw.
   */
  static assert(cond, msg = 'assert failed') {
    if (!cond) {
      onFailure(msg);
    }
  }

  /**
   * Assert the given value to be an object.
   * @func isObject
   * @public
   * @memberOf module:helpers/assert
   * @param {Any} obj An object to evaluate.
   * @param {String} [name] The name of the object.
   */
  static isObject(obj, name) {
    const msg = (name ? `${name} is not an object` : 'object expected');
    Assert.assert(typeof obj === 'object' && obj !== null, msg);
  }

  /**
   * Assert the given value to be undefined or null.
   * @func isUndefinedOrNull
   * @public
   * @memberOf module:helpers/assert
   * @param {Any} obj An object to evaluate.
   * @param {String} [name] The name of the object.
   */
  static isUndefinedOrNull(obj, name) {
    const msg = (name ? `${name} is not undefined or null` : 'undefined or null expected');
    Assert.assert(obj === undefined || obj === null, msg);
  }

  /**
   * Assert the given value to be not undefined or null.
   * @func isNotUndefinedOrNull
   * @public
   * @memberOf module:helpers/assert
   * @param {Any} obj An object to evaluate.
   * @param {String} [name] The name of the object.
   */
  static isNotUndefinedOrNull(obj, name) {
    const msg = (name ? `${name} is undefined or null` : 'undefined or null not expected');
    Assert.assert(obj !== undefined && obj !== null, msg);
  }

  /**
   * Assert the given value to be a boolean.
   * @func isBoolean
   * @public
   * @memberOf module:helpers/assert
   * @param {Any} bool A boolean to evaluate.
   * @param {String} [name] The name of the boolean.
   */
  static isBoolean(bool, name) {
    const msg = (name ? `${name} is not a boolean` : 'boolean expected');
    Assert.assert(typeof bool === 'boolean', msg);
  }

  /**
   * Assert the given value to be a function.
   * @func isFunction
   * @public
   * @memberOf module:helpers/assert
   * @param {Any} func A function to evaluate.
   * @param {String} [name] The name of the function.
   */
  static isFunction(func, name) {
    const msg = (name ? `${name} is not a function` : 'function expected');
    Assert.assert(typeof func === 'function', msg);
  }

  /**
   * Assert the given value to be a number.
   * @func isNumber
   * @public
   * @memberOf module:helpers/assert
   * @param {Any} num A number to validate.
   * @param {String} [name] The name of the variable that stores the number.
   */
  static isNumber(num, name) {
    const msg = (name ? `${name} is not a number` : 'number expected');
    Assert.assert(typeof num === 'number', msg);
  }

  /**
   * Assert the given value is a string and not empty.
   * @func notEmpty
   * @public
   * @memberOf module:helpers/assert
   * @param {String} str A string to evaluate.
   * @param {String} [name] The name of the string.
   */
  static notEmpty(str, name) {
    const msg = (name ? `${name} is not a string or is empty` : 'non-empty string expected');
    Assert.assert(typeof str === 'string' && !RX_EMPTY.test(str), msg);
  }

  /**
   * Assert the given object has the given constructor.
   * @func instanceOf
   * @public
   * @memberOf module:helpers/assert
   * @param {Object} obj An object to evaluate.
   * @param {Object.constructor} constructor A constructor to evaluate.
   * @param {String} [className] The name of the class/constructor.
   */
  static instanceOf(obj, constructor, className) {
    const msg = (className ? `expected instance of ${className}` : 'unexpected instance type');
    Assert.assert(obj instanceof constructor, msg);
  }

  /**
   * Assert the given value to be a non-empty string, a number, or a boolean.
   * @func isScalar
   * @public
   * @memberOf module:helpers/assert
   * @param {Any} value A variant to evaluate.
   * @param {String} [name] The name of the variable that stores the variant.
   */
  static isScalar(value, name) {
    const vType = typeof value;
    const msg = `${name ? `${name} ` : ''}must be string, number, or boolean`;
    Assert.assert(vType === 'string' || vType === 'number' || vType === 'boolean', msg);
    if (vType === 'string') {
      Assert.notEmpty(value, name);
    }
  }

  /**
   * Assert the given value to be an array.
   * @func isArray
   * @public
   * @memberOf module:helpers/assert
   * @param {Any} value A variant to evaluate.
   * @param {String} [name] The name of the variable that stores the variant.
   */
  static isArray(value, name) {
    const msg = (name ? `${name} is not an array` : 'array expected');
    Assert.assert(Object.prototype.toString.call(value) === '[object Array]', msg);
  }
}


export default Assert;
