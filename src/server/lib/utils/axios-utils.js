'use strict';

function addRetryInterceptor(_axios, _logger) {
  _axios.defaults.headers.common['retry'] = 5
  _axios.defaults.headers.common['retryDelay'] = 1000
  _axios.defaults.headers.common['__retryCount'] = 1

  _axios.interceptors.response.use(undefined, (err) => {
    var config = err.config;
    if (!config) {
      return Promise.reject(err);
    }
    
    var header = err.config.headers;
    // If config does not exist or the retry option is not set, reject
    if (!header || !header.retry) {
      return Promise.reject(err);
    }

    // Set the variable for keeping track of the retry count
    header.__retryCount = header.__retryCount || 0;
    _logger.info('Attempt #' + header.__retryCount + '| API URL: ' + config.url);

    // Check if we've maxed out the total number of retries
    if (header.__retryCount >= header.retry) {
      // Reject with the error
      return Promise.reject(err);
    }

    // Increase the retry count
    header.__retryCount += 1;

    // Create new promise to handle exponential backoff
    var backoff = new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, header.retryDelay || 1);
    });

    // Return the promise in which recalls axios to retry the request
    return backoff.then(function () {
      return _axios(config);
    });
  });
}

module.exports = { addRetryInterceptor };
