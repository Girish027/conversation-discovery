// log to console if method level meets log level
function appLogger(options) {
  // indexes of method names match values of levels properties
  const loggerMethods = ['trace', 'debug', 'info', 'warn', 'error'];
  const levels = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    SILENT: 5
  };
  const envLevels = {
    development: levels.TRACE,
    production: levels.SILENT,
    test: levels.ERROR
  };

  // environment variables can override default log level
  let logLevel = levels.INFO;
  if (typeof process.env.LOG_LEVEL !== 'undefined') {
    logLevel = levels[process.env.LOG_LEVEL];
  } else if (typeof process.env.NODE_ENV !== 'undefined') {
    logLevel = envLevels[process.env.NODE_ENV];
  }

  const logger = {};
  loggerMethods.forEach((methodName, methodLevel) => {
    logger[methodName] = (...args) => {
      // only print out if method level is not less than log level
      if (methodLevel >= logLevel) {
        let msgs = [];
        if (options && options.tag) {
          msgs.push(options.tag);
        }
        msgs = msgs.concat(args);
        /* eslint-disable no-alert, no-console */
        console.log(...msgs);
      }
    };
  });
  return logger;
}

export default appLogger;
