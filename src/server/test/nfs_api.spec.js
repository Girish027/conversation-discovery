import fs from 'fs-extra';
import libconfig from 'node-config';
import NfsApi from '../lib/nfs_apis';
import NfsDataStore from '../controllers/gcp-data-store';
import mockLog from '../lib/__mocks__/logger';

let nfsApi, nfsDataStore, config;

describe('nfs-api', function () {
  beforeAll(() => {
    config = libconfig.loadFile(__dirname + '/../config/conversation-discovery-test.json');
    nfsApi = new NfsApi(mockLog, config);
    nfsDataStore = new NfsDataStore(nfsApi, mockLog, config);
    jest.setTimeout(30000);
  });

  describe('uploadDataset', function () {
    test('should upload Dataset', async () => {
      await nfsDataStore.uploadDataset('caaId', 'projectId', 'src/server/test/test-files/dataset.csv', 'dataset.csv');
      expect(fs.existsSync(__dirname + '/mocks/test/caaId/projectId/dataset.csv')).toEqual(true);
    });
  });

  describe('downloadResults', function () {
    test('should delete Dataset', async () => {
      if (fs.existsSync(__dirname + '/mocks/test/caaId/projectId/dataset.csv')) {
        await nfsDataStore.downloadResults('test/caaId/projectId/dataset.csv',__dirname + '/mocks/test/caaId/projectId/copy.csv');
        expect(fs.existsSync(__dirname + '/mocks/test/caaId/projectId/copy.csv')).toEqual(true);
      }
    });
  });

  describe('deleteDataset', function () {
    test('should delete Dataset', async () => {
      if (fs.existsSync(__dirname + '/mocks/test/caaId/projectId/dataset.csv')) {
        await nfsDataStore.deleteDataset('test/caaId/projectId/dataset.csv');
        expect(fs.existsSync(__dirname + '/mocks/test/caaId/projectId/dataset.csv')).toEqual(false);
      }
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
    if (fs.existsSync(__dirname + '/mocks/test/caaId/projectId')) {
      fs.chmodSync(__dirname + '/mocks/test/', '777');
      fs.emptyDirSync(__dirname + '/mocks/test/');
      fs.rmdirSync(__dirname + '/mocks/test/');
    }
  });

});
