#!/usr/bin/env node
/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const nopt = require('nopt'),
  log4js = require('log4js'),
  libconfig = require('node-config'),
  libPath = require('path'),
  initGCListener = require('node-gc-logger').init,
  libUncaught = require('node-uncaught'),
  { Server } = require('./src/server/lib/server'),
  DataLayer = require('./src/server/lib/data-layer'),
  // GcpApis = require('./src/server/lib/gcp_apis'), /* GCP IMPLEMENTATION */
  NfsApis = require('./src/server/lib/nfs_apis'),
  GcpDataStore = require('./src/server/controllers/gcp-data-store'),
  MySQLConnector = require('./src/server/lib/mysql-connector'),
  ESConnector = require('./src/server/lib/es-connector'),
  ESDataLayer = require('./src/server/lib/es-data-layer'),
  Celery = require('./src/server/lib/celery');

const USAGE = `USAGE: ${process.argv.slice(0, 2).join(' ')} --config <path-to-config> [--config <config2> ...]`;

const LOG_CONFIG_KEY = 'service-log.config-path';
const GC_LOG_ENABLED_CONFIG_KEY = 'gc-log.enabled';

const knownOpts = { config: Array };
const shortHands = {};
const opts = nopt(knownOpts, shortHands, process.argv, 2);

if (!opts.config || !opts.config.length) {
  bail('one or more config options are required');
}

const config = libconfig.loadFile(opts.config[0]);
opts.config.shift();
opts.config.forEach((path) => {
  config.addOverlay(libconfig.loadFile(path));
});

let logConfigPath = config.get(LOG_CONFIG_KEY);
if (logConfigPath) {
  logConfigPath = libPath.resolve(__dirname, logConfigPath);
  log4js.configure(logConfigPath);
} else {
  /* eslint-disable no-console */
  console.warn(`${LOG_CONFIG_KEY} not specified in config. log4js not configured`);
  /* eslint-enable no-console */
}

const LOGGER = log4js.getLogger('SRVR');

// fail fast; fix the bug(s)
libUncaught.initialize(LOGGER);

if (config.get(GC_LOG_ENABLED_CONFIG_KEY)) {
  initGCListener({logmgr: log4js});
} else {
  LOGGER.info('gc.logs.disabled');
}

const serverOpts = {
  logmgr: log4js,
  config
};

const connector = new MySQLConnector({
  config: config,
  logger: LOGGER
});
connector.initialize();
const dataLayer = new DataLayer(connector, LOGGER, config);

// Initialize Elastic Search
const es_connector = new ESConnector({
  config: config,
  logger: LOGGER
});
es_connector.initialize();
const esDataLayer = new ESDataLayer(es_connector, LOGGER, config);

const redisClient = new Celery({
  config: config,
  logger: LOGGER
});
redisClient.initialize();

// const gcpApis = new GcpApis(LOGGER, config); /* GCP IMPLEMENTATION */
const nfsApis = new NfsApis(LOGGER, config);
const gcpDataStore = new GcpDataStore(nfsApis, LOGGER, config);

const server = new Server(serverOpts);
server._setupDataStore(dataLayer);
server._setupGcpDataStore(gcpDataStore);
server._setupESDataStore(esDataLayer);
server._setupRedisCeleryQueue(redisClient);

server.once('close', () => {
  log4js.shutdown();
});

process.on('SIGINT', () => {
  server.close('SIGINT');
});

process.on('SIGTERM', () => {
  server.close('SIGTERM');
});

// server.run();

/* eslint-disable no-console */
function bail(msg) {
  if (msg) {
    console.error(msg);
  }

  console.error(USAGE);
  process.exit(1);
}
/* eslint-enable no-console */
