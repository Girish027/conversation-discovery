const Assert = require('node-assert'),
 celery = require('./celery-sentinel'),
 constants = require('./constants');

class Celery {
  constructor(opts) {
    Assert.isObject(opts.config, 'opts.config');
    Assert.isObject(opts.logger, 'opts.logger');
    this._config = opts.config;
    this._logger = opts.logger;
    this._initialize = false;
    this.client = null;
  }

  /**
   * Initialize the redis connection
   */
  async initialize() {
    const logger = this._logger;
    const queueName = this._config.get(constants.REDIS_QUEUE_NAME);
    const celeryRoutes = {};
    celeryRoutes[constants.CELERY_TASK] = {queue: queueName};

    const redisHosts = this._config.get(constants.REDIS_HOSTS);
    const listOfRedisHosts = redisHosts.split(',');
    const redisEndpoints = [];
    listOfRedisHosts.forEach(function (host) {
      redisEndpoints.push({ host: host, port: 26379 });
    });
    const redisClusterName = this._config.get(constants.REDIS_CLUSTER_NAME);

    Assert.notEmpty(redisClusterName, 'redisClusterName');
    Assert.isNonEmptyArray(redisEndpoints, 'redisHostname');

    try {
      this.client = celery.createClient({
        CELERY_SENTINEL_BROKER_URLS: redisEndpoints,
        CELERY_MASTER_NAME: redisClusterName,
        CELERY_OPTS: {},
        CELERY_ROUTES: celeryRoutes
      });
  
      this.client.on('error', function (err) {
        logger.error(`[CELERY] error event: celery redis connection failed! | reason - ${err}`);
      });
    
      this.client.on('connect', function () {
        logger.info('[CELERY] connect event: celery redis connection successful');
      });
      
      this.client.on('end', function () {
        logger.info('[CELERY] connect end: celery redis connection ended');
      });

    } catch (err) {
      logger.error(`[CELERY] initialize: celery redis initialization failed! | reason - ${err}`);
    }
  }

  getClient() {
    return this.client;
  }
}

module.exports = Celery;