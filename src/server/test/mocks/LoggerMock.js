/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */

class LoggerMock {
  constructor() {
  }
 
  info(logString) {
    // eslint-disable-next-line no-console
    console.log(logString);
  }
 
  debug(logString) {
    // eslint-disable-next-line no-console
    console.debug(logString);
  }
 
  warn(logString) {
    // eslint-disable-next-line no-console
    console.warn(logString);
  }
 
  error(logString) {
    // eslint-disable-next-line no-console
    console.error(logString);
  }
}
 
module.exports = LoggerMock;
 