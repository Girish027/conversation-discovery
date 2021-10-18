const celery = require('../lib/celery')

describe.skip('celery-sentinel', function () {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('clientCall', function () {
    test('should verify if the client is created', () => {
      const cel = new celery();
      const client = cel.createClient([{host: 'dev-modelbuilder-redis01.db.shared.int.sv2.247-inc.net', port: 26379 }, {host: 'dev-modelbuilder-redis02.db.shared.int.sv2.247-inc.net', port: 26379}], 'model-master', {'tasks.add': {queue: 'cfd_queue'}})
      client.createTask('tasks.add');
      expect(client.conf.MASTER_NAME).toEqual('model-master');
    });

  });
});