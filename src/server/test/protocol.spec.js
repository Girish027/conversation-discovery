const createMessage = require('../lib/protocol').createMessage;
const MESSAGE = '{"task":"worker.run","args":[{"app":"referencebot","account":"tfscorp","client":"undefined","projectId":"pro-a9c26ee9-19c6-4e93-1fb6-bb2362b8b042","runId":"run-a0360789-c4fd-4091-6991-b55f4634d6c3","datasetURL":"local/undefined-tfscorp-referencebot/pro-a9c26ee9-19c6-4e93-1fb6-bb2362b8b042/DD_DataSet2.csv","stopWords":"[]","numOfClusters":2,"numOfTurns":1}],"kwargs":{},"id":"0e6360a5-6f5c-4d98-8225-43bc1bbfeaf3"}';
const args = [
  {
    app: 'referencebot',
    account: 'tfscorp',
    client: 'undefined',
    projectId: 'pro-a9c26ee9-19c6-4e93-1fb6-bb2362b8b042',
    runId: 'run-a0360789-c4fd-4091-6991-b55f4634d6c3',
    datasetURL: 'local/undefined-tfscorp-referencebot/pro-a9c26ee9-19c6-4e93-1fb6-bb2362b8b042/DD_DataSet2.csv',
    stopWords: '[]',
    numOfClusters: 2,
    numOfTurns: 1
  }
];

describe('Protocol', function () {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('Protocal', function () {
    test('should verify create message', () => {
      const msg = createMessage('worker.run', args, {}, {}, '0e6360a5-6f5c-4d98-8225-43bc1bbfeaf3');
      expect(MESSAGE).toEqual(msg);
    });
    test('should throw an error', () => {
      try {
        createMessage('worker.run', args, {}, {invalid: 'invalid'}, '0e6360a5-6f5c-4d98-8225-43bc1bbfeaf3');
      } catch (e) {
        expect(e).toBe('invalid option: invalid');
      }
    });
  });
});