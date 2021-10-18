const axios = require('axios');
const assert = require('assert'),
  request = require('supertest'),
  ObjectUtils = require('../lib/utils/object-utils'),
  TestUtil = require('./test-util'),
  ESDataLayerMock = require('./mocks/ESDataLayerMock'),
  ESConnectorMock = require('./mocks/ESConnectorMock');
import mockLog from '../lib/__mocks__/logger';
import libconfig from 'node-config';
import { addRetryInterceptor } from '../lib/utils/axios-utils';
import { prepareCreateFaqPayload, prepareUpdateFaqPayload, createCandidateFolder, updateFaqAnswers, createFaqAnswers, assignFaq, getAnswersAPIKey } from '../controllers/answers';

let config, es;

jest.mock('axios', () => jest.fn());
jest.mock('../lib/utils/axios-utils', () => ({
  addRetryInterceptor: jest.fn()
}));


describe('Answers API', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const makeAndStartServerWithMockDB = TestUtil.makeAndStartServerWithMockDB;
  beforeEach(() => {
    config = libconfig.loadFile(__dirname + '/../config/conversation-discovery-test.json');
    const ESConnector = new ESConnectorMock();
    es = new ESDataLayerMock(ESConnector, mockLog, config);
    ObjectUtils.isUndefinedOrNull = jest.fn();
    TestUtil.restoreConfig();
    jest.setTimeout(30000);
  });

  describe('Answers getInterfaceList API', () => {
    test('should return data if status code equals 200', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/interfaces'
      let resData = {res: 'ResponseData'};
      let result = {data: resData};
      axios.mockResolvedValueOnce(result);      
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
    test('should return status code equals 500 when external api call fails', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/interfaces'
      axios.mockImplementation(() => {
        throw new Error();
      });
      addRetryInterceptor.mockReturnValueOnce();
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
    test('should return status code equals 500 when return value from answers api is empty', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/interfaces'
      axios.mockResolvedValueOnce(undefined);
      addRetryInterceptor.mockReturnValueOnce();
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
  describe('Answers updateFAQ API', () => {
    test('should return data if status code equals 500', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send({ responseTitle: 'checkTitle', responseId: '9525', utterances: [{ utterance: 'check', utteranceId: '10000'}]})
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send({ responseId: '9525', utterances: [{ utterance: 'check', utteranceId: '10000'}]})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send({ responseTitle: 'checkTitle', utterances: [{ utterance: 'check', utteranceId: '10000'}]})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send({ responseTitle: 'checkTitle', responseId: '9525'})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send({ responseTitle: 'checkTitle', responseId: '9525', utterances: []})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      ObjectUtils.isUndefinedOrNull.mockReturnValue(true);
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send({})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });
  describe('Answers createFAQ API', () => {
    test('should return data if status code equals 500', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send({ responseTitle: 'checkTitle', responseContent: 'checkTitle', languageId: '1',utterances: [{ utterance: 'check', utteranceId: '10000'}]})
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send({ responseTitle: 'checkTitle', responseContent: 'checkTitle', languageId: '1'})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send({ responseContent: 'checkTitle', languageId: '1',utterances: [{ utterance: 'check', utteranceId: '10000'}]})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send({ responseTitle: 'checkTitle', languageId: '1',utterances: [{ utterance: 'check', utteranceId: '10000'}]})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send({ responseTitle: 'checkTitle', responseContent: 'checkTitle', utterances: [{ utterance: 'check', utteranceId: '10000'}]})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers';
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send({ responseTitle: 'checkTitle', responseContent: 'checkTitle', languageId: '1',utterances: []})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return data if status code equals 400', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      ObjectUtils.isUndefinedOrNull.mockReturnValue(true);
      addRetryInterceptor.mockReturnValueOnce();
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send({})
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });
  describe('Answers getFAQ API', () => {
    test('should return data if status code equals 500', (done) => {
      const url = '/conversationdiscovery/clients/a71okta/accounts/b/applications/q/projects/z/runs/y/clusters/x/interfaceId/1/addToAnswers'
      axios.mockResolvedValueOnce();
      addRetryInterceptor.mockReturnValueOnce();
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
  describe('updatePayload', function () {
    test('UpdatePayload', () => {
      let utterances = [{ utterance: 'check', utteranceId: '10000'}];
      let data = { utterances };
      expect(prepareUpdateFaqPayload(data)).toEqual({
        questionListMap: [{ 
          question: 'check',
          revisedQuestion: '' 
        }]
      });
    });
  });
  describe('createPayload', function () {
    test('createPayload', () => {
      let utterances = [{ utterance: 'check', utteranceId: '10000'}];
      let responseTitle = 'testTitle';
      let responseContent = 'testTitle';
      let data = { utterances, responseTitle, responseContent };
      expect(prepareCreateFaqPayload(data)).toEqual({
        questionListMap: [{ 
          question: 'check',
          revisedQuestion: '' 
        }],
        responseContent,
        responseTitle
      });
    });
  });
  describe('createCandidateFolder', function () {
    test('createCandidateFolder', () => {
      let clientId = 'a71okta'
      let interfaceId = '1';
      let parentFolderId = '0';
      let folderName = 'New Folder';
      let result = { data: { folderID: '1000'}};
      axios.mockResolvedValueOnce(result);
      addRetryInterceptor.mockReturnValueOnce();
      expect(createCandidateFolder(clientId, interfaceId, parentFolderId, folderName, config)).resolves.toEqual({
        folderID: '1000'
      });
    });
  });
  describe('updateFaqAnswers', function () {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('updateFaqAnswers', () => {
      let clientId = 'a71okta'
      let interfaceId = '1';
      let responseId = '9000';
      let data = {
        questionListMap: [{ 
          question: 'check',
          revisedQuestion: '' 
        }]
      };
      let resdata = 'responseData';
      let result = { data: resdata };
      axios.mockResolvedValueOnce(result);
      addRetryInterceptor.mockReturnValueOnce();
      expect(updateFaqAnswers(clientId, interfaceId, responseId, data, config, mockLog)).resolves.toEqual(resdata);
    });
    test('updateFaqAnswers', () => {
      let clientId = 'a71okta'
      let interfaceId = '1';
      let responseId = '9000';
      let data = {
        questionListMap: [{ 
          question: 'check',
          revisedQuestion: '' 
        }]
      };
      axios.mockResolvedValueOnce(undefined);
      addRetryInterceptor.mockReturnValueOnce();
      expect(updateFaqAnswers(clientId, interfaceId, responseId, data, config, mockLog))
        .rejects.toMatchObject(new Error('TypeError: Cannot read property \'data\' of undefined'));
    }); 
  });
  describe('createFaqAnswers', function () {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('createFaqAnswers', () => {
      let clientId = 'a71okta'
      let interfaceId = '1';
      let folderId = '9000';
      let languageId = '1';
      let data = {
        questionListMap: [{ 
          question: 'check',
          revisedQuestion: '' 
        }]
      };
      let resData = {res: 'ResponseData'};
      let result = {data: resData};
      axios.mockResolvedValueOnce(result);
      addRetryInterceptor.mockReturnValueOnce();
      expect(createFaqAnswers(clientId, interfaceId, folderId, languageId, data, config, mockLog)).resolves.toEqual(resData);
    });
    test('createFaqAnswers', () => {
      let clientId = 'a71okta'
      let interfaceId = '1';
      let folderId = '9000';
      let languageId = '1';
      let data = {
        questionListMap: [{ 
          question: 'check',
          revisedQuestion: '' 
        }]
      };
      axios.mockResolvedValueOnce(undefined);
      addRetryInterceptor.mockReturnValueOnce();
      expect(createFaqAnswers(clientId, interfaceId, folderId, languageId, data, config, mockLog))
        .rejects.toMatchObject(new Error('TypeError: Cannot read property \'data\' of undefined'));
    });
  });
  describe('assignFAQ', function () {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('assignFAQ to elasticsearch', () => {
      let clientId = 'testClientMock';
      let accountId, appId, projectId, runId, clusterId, userContext;
      const responseTitle = 'test';
      let UtterancesData = [{ utterance: 'check', utteranceId: '10000'}];
      expect(assignFaq(clientId, accountId, appId, projectId, runId, clusterId, UtterancesData, userContext, responseTitle, es, mockLog)).resolves.toEqual('valid');
    });
    test('assignFAQ when assignment throws an error', () => {
      let clientId = 'testErrorClientMock'
      let accountId, appId, projectId, runId, clusterId, userContext;
      const responseTitle = 'test';
      let UtterancesData = [{ utterance: 'check', utteranceId: '10000'}];
      expect(assignFaq(clientId, accountId, appId, projectId, runId, clusterId, UtterancesData, userContext, responseTitle, es, mockLog))
        .rejects.toMatchObject(new Error('FAILED_TO_UPDATE_ASSIGNED_FAQ'));
    });
  });

  describe('getAnswersAPIKey', function () {
    test('getAnswersAPIKey valid client', () => {
      let client = 'a71okta'
      expect(getAnswersAPIKey(client, config)).toEqual({
        apiKey: 'test',
        clientId: 'a71okta'
      });
    });

    test('getAnswersAPIKey invalid client', () => {
      expect(() => { 
        getAnswersAPIKey('InvalidClient', config); 
      })
        .toThrow('API_KEY_NOT_PROVIDED');
    });
  });
});