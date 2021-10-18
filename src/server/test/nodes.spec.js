/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */

const { filterReadOnlyNodes, removeUtteranceId, prepareCreatePayload, getNodes, updateNode, createNode } = require('../controllers/nodes.js'),
  logger = require('./mocks/LoggerMock'),
  assert = require('assert'),
  request = require('supertest'),
  TestUtil = require('./test-util'),
  UpdateNodes = require('./mocks/update_nodes_mock_data_part.json'),
  Nodes = require('./mocks/nodes_mock_data.json'),
  UpdateNode = require('./mocks/update_nodes_mock_data.json');

import libconfig from 'node-config';
import { addRetryInterceptor } from '../lib/utils/axios-utils';
import mockLog from '../lib/__mocks__/logger';

let config;
const axios = require('axios');
jest.mock('axios');
jest.mock('../lib/utils/axios-utils', () => ({
  addRetryInterceptor: jest.fn()
}));

describe('Test Nodes spec', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const makeAndStartServerWithMockDB = TestUtil.makeAndStartServerWithMockDB;

  beforeEach(() => {
    config = libconfig.loadFile(__dirname + '/../config/conversation-discovery-test.json');
    const data = {
      data: Nodes,
    };
    axios.get.mockImplementationOnce(() => Promise.resolve(data));
    TestUtil.restoreConfig();
  });

  describe('Nodes', () => {
    describe('Get All Nodes', () => {
      test('should return 500 for get-all nodes api', (done) => {
        const data = {
          data: Nodes,
        };
        axios.get.mockImplementationOnce(() => Promise.resolve(data));
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/cluster-1/intents';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .get(url)
            .expect(500)
            .end((err) => {
              assert(!err, err);
              server.close('die');
              done();
            });
        });
      });
    });

    describe('Create Node', () => {
      test('should return 500 for create intent api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/cluster-1/intents';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .post(url)
            .send(UpdateNodes)
            .set('Content-Type', 'application/json')
            .expect(500)
            .end((err) => {
              assert(!err, err);
              server.close('die');
              done();
            });
        });
      });
      test('should return 400 for create intent api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/cluster-1/intents';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .post(url)
            .send(UpdateNode)
            .set('Content-Type', 'application/json')
            .expect(400)
            .end((err) => {
              assert(!err, err);
              server.close('die');
              done();
            });
        });
      });
    });

    describe('Update Node', () => {
      test('should return 500 for update intent api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/cluster-1/intents';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .patch(url)
            .send(UpdateNode)
            .set('Content-Type', 'application/json')
            .expect(500)
            .end((err) => {
              assert(!err, err);
              server.close('die');
              done();
            });
        });
      });
    });

    describe('filter read only nodes', () => {
      test('filter read only nodes', (done) => {
        const filteredNodes = filterReadOnlyNodes(new logger(), Nodes);
        filteredNodes.then((nodes) => {
          assert(nodes.data.length, 2);
        })
        done();
      });
      test('filter read only nodes', (done) => {
        let nodes = {};
        const filteredNodes = filterReadOnlyNodes(new logger(), nodes);
        filteredNodes.then((nodes) => {
          assert(nodes.data.length, 0);
        })
        done();
      });
    })

    describe('removeUtteranceId', () => {
      test('removeUtteranceId', (done) => {
        const updatedNode = removeUtteranceId(UpdateNode);
        updatedNode.then((payload) => {
          expect(payload.utterances[1].utterancesId).toEqual(undefined);
          expect(payload.utterances[0].utterancesId).toEqual(undefined);
        });
        done();
      });
    });

    describe('prepareCreatePayload', () => {
      test('prepareCreatePayload', (done) => {
        const createPayload = prepareCreatePayload(UpdateNode);
        createPayload.then((payload) => {
          expect(payload.utterances[1].utterancesId).toEqual(undefined);
          expect(payload.utterances[0].utterancesId).toEqual(undefined);
          expect(payload.nodeId).toEqual(undefined);
        });
        done();
      });
    });
  
    describe('getNodes', function () {
      test('getNodes', () => {
        let clientId = 'testClient'
        let appId = 'testApp';
        let userid = 'testuser';
        let offset, limit, isModified;
        let result = { data: { folderID: '1000'}};
        axios.mockResolvedValueOnce(result);
        addRetryInterceptor.mockReturnValueOnce();
        expect(getNodes(mockLog, clientId, appId, config, userid, offset, limit, isModified)).resolves.toEqual({
          folderID: '1000'
        });
      });

      test('getNodes Error', () => {
        let clientId = 'testClient'
        let appId = 'testApp';
        let userid = 'testuser';
        let offset, limit, isModified;
        axios.mockResolvedValueOnce(undefined);
        addRetryInterceptor.mockReturnValueOnce();
        expect(getNodes(mockLog, clientId, appId, config, userid, offset, limit, isModified))
          .rejects.toMatchObject(new TypeError('TypeError: Cannot read property \'data\' of undefined'));
      });
    });

    describe('updateNodes', function () {
      test('updateNodes', () => {
        let clientId = 'testClient'
        let appId = 'testApp';
        let userid = 'testuser';
        let nodeId;
        let payload ={ test: 'test'};
        let result = { data: { folderID: '1000'}};
        axios.mockResolvedValueOnce(result);
        addRetryInterceptor.mockReturnValueOnce();
        expect(updateNode(mockLog, clientId, appId, config, nodeId, payload, userid)).resolves.toEqual({
          folderID: '1000'
        });
      });

      test('updateNodes Error', () => {
        let clientId = 'testClient'
        let appId = 'testApp';
        let userid = 'testuser';
        let nodeId;
        let payload ={ test: 'test'};
        axios.mockResolvedValueOnce(undefined);
        addRetryInterceptor.mockReturnValueOnce();
        expect(updateNode(mockLog, clientId, appId, config, nodeId, payload, userid))
          .rejects.toMatchObject(new TypeError('TypeError: Cannot read property \'data\' of undefined'));
      });
    });

    describe('createNodes', function () {
      test('createNodes', () => {
        let clientId = 'testClient'
        let appId = 'testApp';
        let userid = 'testuser';
        let nodeId;
        let payload ={ test: 'test'};
        let result = { data: { folderID: '1000'}};
        axios.mockResolvedValueOnce(result);
        addRetryInterceptor.mockReturnValueOnce();
        expect(createNode(mockLog, clientId, appId, config, nodeId, payload, userid)).resolves.toEqual({
          folderID: '1000'
        });
      });

      test('createNodes Error', () => {
        let clientId = 'testClient'
        let appId = 'testApp';
        let userid = 'testuser';
        let nodeId;
        let payload ={ test: 'test'};
        axios.mockResolvedValueOnce(undefined);
        addRetryInterceptor.mockReturnValueOnce();
        expect(createNode(mockLog, clientId, appId, config, nodeId, payload, userid))
          .rejects.toMatchObject(new TypeError('TypeError: Cannot read property \'data\' of undefined'));
      });
    });
  });
});
