/**
 * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
 * unpublished, proprietary work which is fully protected under
 * copyright law. This code may only be used pursuant to a valid
 * license from 24/7 Customer, Inc.
 */

/**
 * Object Utils
 * @module utils/object-utils
 */

'use strict';

const arrayConstructor = [].constructor;
const objectConstructor = {}.constructor;
const booleanConstructor = true.constructor;
const stringConstructor = 'test'.constructor;

const whatIsIt = (object) => {
  if (object === null) {
    return 'null';
  }
  else if (object === undefined) {
    return 'Undefined';
  }
  else if (object.constructor === stringConstructor) {
    return 'String';
  }
  else if (object.constructor === arrayConstructor) {
    return 'Array';
  }
  else if (object.constructor === objectConstructor) {
    return 'Object';
  }
  else if (object.constructor === booleanConstructor) {
    return 'Boolean';
  }
  else if (typeof object === 'number') {
    return 'Number';
  }
  else {
    return 'dont know';
  }
};


class ObjectUtils {

  static isUndefinedOrNull(obj) {
    return obj === undefined || obj === null;
  }

  //TODO: This is String utility functions
  static isEmptyOrNull(object) {
    return ObjectUtils.isUndefinedOrNull(object) || whatIsIt(object) === 'Array' && object.length === 0 ||
    ( whatIsIt(object) === 'Object' && Object.keys(object).length === 0 ) ||
    ( whatIsIt(object) === 'String' && object.length === 0) ? true : false ||
    ( whatIsIt(object) === 'Boolean') ? false : true || // eslint-disable-line no-constant-condition
    ( whatIsIt(object) === 'Number') ? false : true;
  }

  static isObjectEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  static removeEmpty(object) {
    const _object = object;
    Object.keys(_object).forEach((key) => {
      if (ObjectUtils.isEmptyOrNull(_object[key])) {
        delete _object[key];
      }
    });
    return _object;
  }

  static removeSpecificKeys(obj, keys) {
    const retVal = obj;
    keys.map(key => delete retVal[key]);
    return retVal;
  }

  static filterSpecificKeys(obj, keys) {
    const retVal = {};
    keys.forEach((key) => {
      retVal[key] = obj[key];
    });
    return retVal;
  }

  static cleanObject(obj) {
    const tempObj = Object.assign({}, obj);
    Object.keys(tempObj).forEach((key) => {
      if (tempObj[key] && typeof tempObj[key] === 'object') ObjectUtils.cleanObject(tempObj[key]);
      else if (ObjectUtils.isUndefinedOrNull(tempObj[key])) delete tempObj[key];
    });
    return tempObj;
  }
}

module.exports = ObjectUtils;
