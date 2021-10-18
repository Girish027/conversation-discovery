const celeryTasks = require('../lib/celery-tasks');

describe('celery-tasks', function () {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('createClient', function () {

    test('should add task ', () => {
      celeryTasks.createAddTask([{host: 'dev-modelbuilder-redis01.db.shared.int.sv2.247-inc.net', port: 26379 }, {host: 'dev-modelbuilder-redis02.db.shared.int.sv2.247-inc.net', port: 26379}], 'model-master', 'tasks.add', [1, 2], 'cfd_queue');
    });

  });
});