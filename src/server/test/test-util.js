
const log4js = require('log4js'),
  libPath = require('path'),
  libConfig = require('node-config'),
  dataLayerMock = require('./mocks/DataLayerMock'),
  logger = require('./mocks/LoggerMock'),
  mysqlConnectorMock = require('./mocks/MySQLConnectorMock'),
  nfsDataStoreMock = require('./mocks/NfsDataStoreMock'),
  ESConnectorMock = require('./mocks/ESConnectorMock'),
  ESDataLayerMock = require('./mocks/ESDataLayerMock'),
  { Server } = require('../lib/server');


const HEARTBEAT_PATH = libPath.join(__dirname, '/heartbeat.txt');

const SERVICE_LOG_PATH = libPath.resolve(`${__dirname}/../config/conversation-discovery-logging.json`);
log4js.configure(SERVICE_LOG_PATH, {});

let RAW_CONFIG = require('../config/conversation-discovery-test.json');

const RAW_CONFIG_SOURCE = JSON.stringify(RAW_CONFIG);
restoreConfig();

function getRawConfig() {
  return RAW_CONFIG;
}

function restoreConfig() {
  RAW_CONFIG = JSON.parse(RAW_CONFIG_SOURCE);
  RAW_CONFIG.listen.port = 0;
  RAW_CONFIG.health['heartbeat-path'] = HEARTBEAT_PATH;
  RAW_CONFIG['gc-log'].enabled = false;
}

function getHeartbeatPath() {
  return HEARTBEAT_PATH;
}

function makeAndStartServer(cb) {
  const config = libConfig.fromObject(RAW_CONFIG);
  const serverOpts = {
    config,
    logmgr: log4js,
    isTest: true,
  };

  const server = new Server(serverOpts);
  server._configureMiddlewareAndRoutes(() => {
    server.run();
  });

  server.once('listening', (listenInfo) => {
    cb(server, listenInfo.httpServer);
  });
}

function makeAndStartServerWithMockDB(cb) {
  const config = libConfig.fromObject(RAW_CONFIG);
  const serverOpts = {
    config,
    logmgr: log4js,
    isTest: true,
  };
  const LOGGER = log4js.getLogger('SRVR');
  const server = new Server(serverOpts);
  const mySqlConn = new mysqlConnectorMock();
  const dataLayer = new dataLayerMock(mySqlConn, LOGGER, config);
  const nfsDataStore = new nfsDataStoreMock(null, LOGGER, config);
  const ESConnector = new ESConnectorMock();
  const ESDataLayer = new ESDataLayerMock(ESConnector, LOGGER, config);
  server._setupDataStore(dataLayer);
  server._setupGcpDataStore(nfsDataStore);
  server._setupESDataStore(ESDataLayer)
  // server._configureMiddlewareAndRoutes(() => {
  //   server.run();
  // });
  server.once('listening', (listenInfo) => {
    cb(server, listenInfo.httpServer);
  });
  server.run();
}

function createdbConnection() {
  const config = libConfig.fromObject(RAW_CONFIG);
  const opts = {
    config,
    logger: new logger()
  };
  return new mysqlConnectorMock(opts);
}


module.exports = {
  makeAndStartServer,
  makeAndStartServerWithMockDB,
  getRawConfig,
  restoreConfig,
  getHeartbeatPath,
  createdbConnection
};

