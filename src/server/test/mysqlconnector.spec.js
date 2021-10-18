import mysqlConnector from '../lib/mysql-connector';
const log4js = require('log4js'),
  mysql = require('mysql'),
  libconfig = require('node-config');
const config = libconfig.loadFile(__dirname + '/../config/conversation-discovery-test.json');
const serverOpts = {
  logger: log4js.getLogger('SRVR'),
  config
};

jest.mock('mysql', () => ({
  createPool: jest.fn()
}));

let MysqlConnector;
describe('mysql-connector check', function () {
  beforeAll(() => {
    MysqlConnector = new mysqlConnector(serverOpts);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('getConnectionForTransactions', function () {
    test('getConnectionForTransactions test', () => {
      expect(MysqlConnector.getConnectionForTransactions()).rejects.toMatchObject(new Error('Database not initialized'));
    });
  });

  describe('Initialize', function () {
    test('Initialize test', () => {
      mysql.createPool.mockImplementation(() => 'test');
      expect(MysqlConnector.initialize())
        .rejects.toMatchObject(
          new Error('Couldn\'t connect to Mysql database: TypeError [ERR_INVALID_ARG_TYPE]: The \'original\' argument must be of type Function. Received type undefined'));
    });

    test('Initialize test', () => {
      mysql.createPool.mockImplementation(() => undefined);
      expect(MysqlConnector.initialize())
        .rejects.toMatchObject(new Error('Could not connect to Mysql database'));
    });
  });

  describe('executeQuery', function () {
    test('executeQuery test', () => {
      expect(MysqlConnector.executeQuery())
        .rejects.toMatchObject(
          new Error('Database not initialized'));
    });
  });

  describe('getPool', function () {
    test('getPool test', () => {
      expect(() => { 
        MysqlConnector.getPool(); 
      })
        .toThrow('Database not initialized');    
    });
  });
});