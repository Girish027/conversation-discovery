/**
 * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
 * unpublished, proprietary work which is fully protected under
 * copyright law. This code may only be used pursuant to a valid
 * license from 24/7 Customer, Inc.
 */

/**
 * UniqueId
 * @module utils/unique-id
 */
'use strict';
/* eslint no-bitwise: "off" */

class UniqueId {
  /**
   * uuid Generates a UUID using randomizer
   * @return {string} UUID generated
   */
  static uuid() {
    const s4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    // then to call it, plus stitch in '4' in the third group
    return (`${s4()}${s4()}-${s4()}-4${s4().substr(0, 3)}-${s4()}-${s4()}${s4()}${s4()}`).toLowerCase();
  }

}

module.exports = UniqueId;
