import esConnector from '../lib/es-connector';

const log4js = require('log4js'),
  { Client } = require('@elastic/elasticsearch'),
  libconfig = require('node-config');
const config = libconfig.loadFile(__dirname + '/../config/conversation-discovery-test.json');
const fetchClusterConversations = require('../queries/fetchClusterConversations.json');

const serverOpts = {
  logger: log4js.getLogger('SRVR'),
  config
};
let myEsConnector;
jest.mock('@elastic/elasticsearch', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    search: jest.fn(),
    updateByQuery: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});
describe('esConnector check', function () {
  beforeAll(() => {
    myEsConnector = new esConnector(serverOpts);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('updateESData', function () {
    test.skip('updateESData test', () => {
      myEsConnector.initialize();
      var fetchCC = JSON.parse(JSON.stringify(fetchClusterConversations));
      expect(myEsConnector.updateESData(fetchCC)).toResolve;
    });
  });

  describe('initialize', function () {
    beforeEach(() => {
      myEsConnector.client = new Client();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('initialize test', () => {
      expect(myEsConnector.initialize()).toResolve;
    });
  });

  describe('getClient', function () {
    test('getClient test', async () => {
      await expect(myEsConnector.getClient()).toResolve;
    });
  });

  describe('searchESData', function () {
    test('searchESData test', async () => {
      var fetchCC = JSON.parse(JSON.stringify(fetchClusterConversations));
      expect(myEsConnector.searchESData(fetchCC)).toResolve;
    });
  });
});


