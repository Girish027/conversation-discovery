import ESDataLayer from '../lib/es-data-layer';
import esConnector from '../lib/es-connector';
import mockLog from '../lib/__mocks__/logger';
import libconfig from 'node-config';

const { testConfig, allConversationES, filterConversationES, interactionConversationES, allClusterDataES,
  allConversation, filterConversation, interactionConversation, allClusterData, updateClusterName, markAsFinalized } = require('./es-test-configs');
let esDataLayer, config;
jest.mock('../lib/es-connector');

describe('es-data-layer', function () {
  beforeAll(() => {
    config = libconfig.loadFile(__dirname + '/../config/conversation-discovery-test.json');
    esDataLayer = new ESDataLayer(esConnector, mockLog, config);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('getClusterConversations', function () {
    test('conversation without filters', () => {
      esConnector.searchESData.mockReturnValue(undefined);
      expect(esDataLayer.getClusterConversations(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId, testConfig.clusterId, undefined,
        undefined)).resolves.toEqual([]);
    });

    test('conversation without filters', () => {
      esConnector.searchESData.mockReturnValue(allConversationES);
      expect(esDataLayer.getClusterConversations(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId, testConfig.clusterId, undefined,
        undefined)).resolves.toEqual(allConversation);
    });

    test('conversation with search and similarity filter', () => {
      esConnector.searchESData.mockReturnValue(filterConversationES);
      expect(esDataLayer.getClusterConversations(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId, testConfig.clusterId, testConfig.searchFilter,
        testConfig.similarityFilter)).resolves.toEqual(filterConversation);
    });

    test('conversation with search and similarity filter', () => {
      esConnector.searchESData.mockReturnValue(filterConversationES);
      expect(esDataLayer.getClusterConversations(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId, testConfig.clusterId, testConfig.searchFilter,
        'test')).resolves.toEqual(filterConversation);
    });
  });

  describe('postData', function () {
    test('postData', () => {
      expect(esDataLayer.postData()).toResolve;
    });
  });

  describe('getAllConversations', function () {
    test('fetch all conversation for an interaction ID', () => {
      esConnector.searchESData.mockReturnValue(interactionConversationES);
      expect(esDataLayer.getAllConversations(testConfig.clusterId, testConfig.interactionId))
        .resolves.toEqual(interactionConversation);
    });
    test('fetch conversation for an interaction ID when query returns empty', () => {
      esConnector.searchESData.mockReturnValue(undefined);
      expect(esDataLayer.getAllConversations(testConfig.clusterId, testConfig.interactionId))
        .resolves.toEqual([]);
    });
  });

  describe('getAllClusterData', function () {
    test('all cluster level data', () => {
      esConnector.searchESData.mockReturnValue(allClusterDataES);
      expect(esDataLayer.getAllClusterData(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId)).resolves.toEqual(allClusterData);
    });
    test('cluster level data when query returns empty', () => {
      esConnector.searchESData.mockReturnValue(undefined);
      expect(esDataLayer.getAllClusterData(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId)).resolves.toEqual([]);
    });
  });

  describe('updateClusterData', function () {
    test('update cluster name when query returns empty', () => {
      esConnector.updateESData.mockReturnValue(undefined);
      expect(esDataLayer.updateClusterData(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId, testConfig.clusterId, testConfig.sourceClusterName,
        testConfig.paramsClusterName)).resolves.toEqual(undefined);
    });

    test('update cluster name', () => {
      esConnector.updateESData.mockReturnValue(updateClusterName);
      expect(esDataLayer.updateClusterData(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId, testConfig.clusterId, testConfig.sourceClusterName,
        testConfig.paramsClusterName)).resolves.toEqual({ status: 'success' });
    });

    test('mark as finalized', () => {
      esConnector.updateESData.mockReturnValue(markAsFinalized);
      expect(esDataLayer.updateClusterData(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId, testConfig.clusterId, testConfig.sourceFinalized,
        testConfig.paramsFinalized)).resolves.toEqual({ status: 'success' });
    });
  });
  describe('updateConversationData', function () {
    test('updateConversationData when query returns empty', () => {
      esConnector.updateESData.mockReturnValue(undefined);
      expect(esDataLayer.updateConversationData(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId, testConfig.clusterId, testConfig.interactionId, testConfig.sourceClusterName,
        testConfig.paramsClusterName)).resolves.toEqual(undefined);
    });

    test('updateConversationData', () => {
      esConnector.updateESData.mockReturnValue(interactionConversationES);
      expect(esDataLayer.updateConversationData(testConfig.clientId, testConfig.accountId, testConfig.appId,
        testConfig.projectId, testConfig.runId, testConfig.clusterId, testConfig.interactionId, testConfig.sourceClusterName,
        testConfig.paramsClusterName)).resolves.toEqual({ status: 'success' });
    });
  });

  describe('bulkIndexDocuments', function () {
    test('bulkIndexDocuments when aborted is true', () => {
      esConnector.bulkIngest.mockReturnValue({aborted: true});
      expect(esDataLayer.bulkIndexDocuments()).resolves.toEqual();
    });

    test('bulkIndexDocuments when aborted is false', () => {
      esConnector.bulkIngest.mockReturnValue({aborted: false});
      expect(esDataLayer.bulkIndexDocuments()).resolves.toEqual();
    });
    test('bulkIndexDocuments when query returns empty', () => {
      esConnector.bulkIngest.mockReturnValue(undefined);
      expect(esDataLayer.bulkIndexDocuments()).resolves.toEqual();
    });
  });

  describe('deleteAnalysisDataByCluster', function () {
    test('deleteAnalysisDataByCluster when query returns empty', () => {
      esConnector.deleteESDataByClusterId.mockReturnValue(undefined);
      expect(esDataLayer.deleteAnalysisDataByCluster([], 'testRun')).resolves.toEqual(undefined);
    });

    test('deleteAnalysisDataByCluster when query returns response', () => {
      esConnector.deleteESDataByClusterId.mockReturnValue({response: 'Response'});
      expect(esDataLayer.deleteAnalysisDataByCluster(['testCluster'], 'testRun')).resolves.toEqual({response: 'Response'});
    });
  });

  describe('deleteAnalysisDataByRun', function () {
    test('deleteAnalysisDataByRun when query returns empty', () => {
      esConnector.deleteESDataByRunId.mockReturnValue(undefined);
      expect(esDataLayer.deleteAnalysisDataByRun('testRun')).resolves.toEqual(undefined);
    });

    test('deleteAnalysisDataByRun when query returns response', () => {
      esConnector.deleteESDataByRunId.mockReturnValue({response: 'Response'});
      expect(esDataLayer.deleteAnalysisDataByRun('testRun')).resolves.toEqual(undefined);
    });
  });
});