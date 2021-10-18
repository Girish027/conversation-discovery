const celery = require('../lib/celery');
const log4js = require('log4js'),
  libconfig = require('node-config');
const { createClient } = require('../lib/celery-sentinel');
const config = libconfig.loadFile(__dirname + '/../config/conversation-discovery-test.json');

const serverOpts = {
  logger: log4js.getLogger('SRVR'),
  config
};
let mycelery;
jest.mock('../lib/celery-sentinel', () => ({
  createClient: jest.fn()
}));

describe.skip('celery', function () {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('createClient', function () {
    test('should verify if the client is created', () => {
      const cel = new celery();
      const client = cel.createClient([{host: 'dev-modelbuilder-redis01.db.shared.int.sv2.247-inc.net', port: 26379 }, {host: 'dev-modelbuilder-redis02.db.shared.int.sv2.247-inc.net', port: 26379}], 'model-master', {'tasks.add': {queue: 'cfd_queue'}})
      client.createTask('tasks.add');
      expect(client.conf.MASTER_NAME).toEqual('model-master');
    });
  });
});

describe('celery check', function () {
  beforeAll(() => {
    mycelery = new celery(serverOpts);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('initialize', function () {
    test('initialize test', () => {
      createClient.mockImplementation(() => 'test');
      expect(mycelery.initialize()).toResolve;
    });
  });

  describe('getClient', function () {
    test('getClient test', async () => {
      createClient.mockImplementation(() => 'test');
      mycelery.initialize();
      await expect(mycelery.getClient()).toResolve;
    });
  });
});
