/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
const assert = require('assert'),
  request = require('supertest'),
  TestUtil = require('./test-util'),
  ESDataLayerMock = require('./mocks/ESDataLayerMock'),
  dataLayerMock = require('./mocks/DataLayerMock'),
  mysqlConnectorMock = require('./mocks/MySQLConnectorMock'),
  ESConnectorMock = require('./mocks/ESConnectorMock');
const clusters = require('../controllers/clusters');

import mockLog from '../lib/__mocks__/logger';
import libconfig from 'node-config';
import { assignIntentToConversation } from '../controllers/conversations';

let config, es;
describe('Test conversations spec', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const makeAndStartServerWithMockDB = TestUtil.makeAndStartServerWithMockDB;
  beforeEach(() => {
    config = libconfig.loadFile(__dirname + '/../config/conversation-discovery-test.json');
    const ESConnector = new ESConnectorMock();
    es = new ESDataLayerMock(ESConnector, mockLog, config);
    TestUtil.restoreConfig();
    jest.setTimeout(30000);
  });

  describe('getClusterConversations', () => {
    test('should return 200 for getClusterConversations api ', (done) => {
      const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/testCluster/conversations';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(200)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return 400 for getClusterConversations api ', (done) => {
      const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-123/runs/run-1/clusters/testClusterMock/conversations';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return 400 for getClusterConversations api ', (done) => {
      const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-123/clusters/testClusterMock/conversations';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return 400 for getClusterConversations api ', (done) => {
      const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/testClusterMock/conversations';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return 400 for getClusterConversations api ', (done) => {
      const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/testClusterMock/conversations';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .query({similarity: 'Test1'})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for getClusterConversations api ', (done) => {
      const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/testClusterMock/conversations';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .query({tId: 'Test1'})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });

  describe('assignIntenttoConversations', function () {
    let db, mySqlConn
    beforeEach(() => {
      clusters.validateRequest = jest.fn();
      mySqlConn = new mysqlConnectorMock();
      db = new dataLayerMock(mySqlConn, mockLog, config);
      jest.clearAllMocks();
    });
    test('assignIntent to elasticsearch', async () => {
      let gclientId = 'testClientMock';
      let gaccountId = 'testAccountMock';
      let gappId = 'testApp';
      let gprojectId = 'testProject';
      let grunId = 'testRun';
      let gclusterId = 'testCluster';
      let params = { 
        clientId : { value: gclientId },
        accountId : { value: gaccountId },
        applicationId : { value: gappId },
        projectId : { value: gprojectId },
        runId : { value: grunId },
        clusterId : { value: gclusterId },
        body : { originalValue : { utterances : [{ utteranceId: 'test'}], nodeName: 'testNode' }}
      }
      let req = { 
        swagger : { params },
        app: { locals : { es , db } },
        userContext: {},
        logger: mockLog
      }
      clusters.validateRequest.mockReturnValue();
      expect(assignIntentToConversation(req))
        .resolves.toEqual('valid');
    });

    test('assignIntent to elasticsearch error', async () => {
      let gclientId = 'testErrorClientMock';
      let gaccountId = 'testAccountMock';
      let gappId = 'testApp';
      let gprojectId = 'testProject';
      let grunId = 'testRun';
      let gclusterId = 'testCluster';
      let params = { 
        clientId : { value: gclientId },
        accountId : { value: gaccountId },
        applicationId : { value: gappId },
        projectId : { value: gprojectId },
        runId : { value: grunId },
        clusterId : { value: gclusterId },
        body : { originalValue : { utterances : [{ utteranceId: 'test'}], nodeName: 'testNode' }}
      }
      let req = { 
        swagger : { params },
        app: { locals : { es , db } },
        userContext: {},
        logger: mockLog
      }
      clusters.validateRequest.mockReturnValue();
      expect(assignIntentToConversation(req))
        .rejects.toMatchObject(new Error('FAIL_TO_UPDATE_ASSIGNED_INTENT'));
    });

    test('assignIntent to elasticsearch error', async () => {
      let gclientId = 'testErrorClientMock';
      let gaccountId = 'testAccountMock';
      let gappId = 'testApp';
      let gprojectId = 'testProject';
      let grunId = 'testRun';
      let gclusterId = 'testCluster';
      let params = { 
        clientId : { value: gclientId },
        accountId : { value: gaccountId },
        applicationId : { value: gappId },
        projectId : { value: gprojectId },
        runId : { value: grunId },
        clusterId : { value: gclusterId },
        body : { originalValue : { utterances : [{ utteranceId: undefined}], nodeName: 'testNode' }}
      }
      let req = { 
        swagger : { params },
        app: { locals : { es , db } },
        userContext: { userinfo: { name: 'testName'}},
        logger: mockLog
      }
      clusters.validateRequest.mockReturnValue();
      expect(assignIntentToConversation(req))
        .rejects.toMatchObject(new Error('FAIL_TO_UPDATE_ASSIGNED_INTENT'));
    });
  });
});