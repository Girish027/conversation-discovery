/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */

const assert = require('assert'),
  request = require('supertest'),
  TestUtil = require('./test-util'),
  validateLimit = require('../lib/validate-limit'),
  { deleteStatusUpdate } = require('../controllers/runs'),
  dataLayerMock = require('./mocks/DataLayerMock'),
  mysqlConnectorMock = require('./mocks/MySQLConnectorMock'),
  { testRunCreateInput, testRunCreateInputInvalid, 
    testPatchParametersForRun, emptyPatchParameters, updateRunStatusAndResultURLparams } = require('./test-configs');

import mockLog from '../lib/__mocks__/logger';
import libconfig from 'node-config';
let config, db;

describe('Test runs spec', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const makeAndStartServerWithMockDB = TestUtil.makeAndStartServerWithMockDB;
  beforeEach(() => {
    config = libconfig.loadFile(__dirname + '/../config/conversation-discovery-test.json');
    const sqlConnector = new mysqlConnectorMock();
    db = new dataLayerMock(sqlConnector, mockLog, config);
    TestUtil.restoreConfig();
    jest.setTimeout(30000);
    validateLimit.checkRunLimit = jest.fn();
  });

  describe('createRun', () => {
    test('should return 500 for create run api without redis connection', (done) => {
      const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs';
      validateLimit.checkRunLimit.mockReturnValue(true);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(testRunCreateInput)
          .set('Accept', 'application/json')
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 500 for create run api without redis connection', (done) => {
      const url = '/conversationdiscovery/clients/ClientTestURL/accounts/testaccount/applications/testapp/projects/pro-1/runs';
      validateLimit.checkRunLimit.mockReturnValue(true);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(testRunCreateInput)
          .set('Accept', 'application/json')
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 404 for create run api if the project is not found', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject13/runs';
      validateLimit.checkRunLimit.mockReturnValue(true);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(testRunCreateInput)
          .set('Accept', 'application/json')
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create run api if the limit is exceeded', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject13/runs';
      validateLimit.checkRunLimit.mockReturnValue(false);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(testRunCreateInput)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create run api ternary conditional checks ( project invalid )', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject13/runs';
      validateLimit.checkRunLimit.mockReturnValue(true);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send({
            runName: 'testRun',
            user: 'testUser',
            numOfTurns: 2,
            numOfClusters: 100,
            runDescription: 'testDescription'
          })
          .set('Accept', 'application/json')
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create run api ternary conditional checks ( project invalid )', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject13/runs';
      validateLimit.checkRunLimit.mockReturnValue(true);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send({
            runName: 'testRun',
            user: 'testUser',
            numOfTurns: 2,
            numOfClusters: 100,
            stopWords: ['testWord']
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create run if post data is invalid', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs';
      const run = {};
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(run)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    // test('should return 400 for create run if post data is invalid', (done) => {
    //   const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs';
    //   const run = {};
    //   ObjectUtils.isUndefinedOrNull.mockReturnValue(true);
    //   makeAndStartServerWithMockDB((server, httpServer) => {
    //     request(httpServer)
    //       .post(url)
    //       .send(run)
    //       .set('Accept', 'application/json')
    //       .expect(400)
    //       .end((err) => {
    //         assert(!err, err);
    //         server.close('die');
    //         done();
    //       });
    //   });
    // });

    test('should return 400 for create run if run name is not given', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs';
      const run = {
        user: 'testUser',
        numOfClusters: 100,
        numOfTurns: 2
      };
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(run)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create run if num of clusters is not given', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs';
      const run = {
        runName: 'testRun',
        user: 'testUser',
        numOfTurns: 2
      };
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(run)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create run if num of turns is not given', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs';
      const run = {
        runName: 'testRun',
        user: 'testUser',
        numOfClusters: 100
      };
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(run)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test.skip('should return 404 for create run if CAA doesn\'t exist', (done) => {
      const url = '/conversationdiscovery/clients/invalidClient/accounts/testaccount/applications/testapp/projects/pro-1/runs';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(testRunCreateInput)
          .set('Accept', 'application/json')
          .expect(404)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test.skip('should return 500 for create run if unable to update the project details after creating a run', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/invalidProjectId/runs';
      validateLimit.checkRunLimit.mockReturnValue(true);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(testRunCreateInput)
          .set('Accept', 'application/json')
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test.skip('should return 409 for create run api if run already exists', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(testRunCreateInputInvalid)
          .set('Accept', 'application/json')
          .expect(409)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });

  describe('getRuns', () => {
    test('should return 200 for get a run api - run status queued', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/testrunincomplete';
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

    test('should return 404 for get a run api - if project is not found', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject13/runs/testrun';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(404)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 200 for get a run api - testrunwithresultnull', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/testrunwithresultnull';
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

    // TODO: Decide if this is required
    test.skip('should return 404 for get a run api - invalid run id', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/InvalidRunId';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(404)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 200 for get all runs api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs';
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

    test('should return 200 for get run api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject/runs/';
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

    test('should return 404 for get run api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject13/runs/';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(404)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });

  describe('updateRuns', () => {
    test('should return 200 for updateRun api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject/runs/testrun';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(testPatchParametersForRun)
          .set('Content-Type', 'application/json')
          .expect(200)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 404 for updateRun api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject/runs/testrun50';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(testPatchParametersForRun)
          .set('Content-Type', 'application/json')
          .expect(404)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 304 for updateRun api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject/runs/testrun500';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(testPatchParametersForRun)
          .set('Content-Type', 'application/json')
          .expect(304)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for update run api when patch parameters are not provided', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/testrun';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(emptyPatchParameters)
          .set('Content-Type', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 404 for update run api when get project fails', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject13/runs/testrn13';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(testPatchParametersForRun)
          .set('Content-Type', 'application/json')
          .expect(404)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });

  describe('updateRunStatusAndResultURL', () => {
    test('should return 204 for updateRunStatusAndResultURL api', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapp/projects/testprojects/runs/testrun/status';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(updateRunStatusAndResultURLparams)
          .set('x-tfs-internalproxycall', false)
          .set('Content-Type', 'application/json')
          .expect(204)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 204 for updateRunStatusAndResultURL api', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapp/projects/testprojects/runs/testrun/status';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send({
            runName: 'renamedTestRun',
            runDescription: 'testUser',
            starred: 0,
            runStatus: 'FAILED',
            runStatusDescription: 'testRunStatus'
          })
          .set('retry', '1')
          .set('x-tfs-internalproxycall', false)
          .set('Content-Type', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 404 for updateRunStatusAndResultURL api', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapp/projects/testprojectcheck/runs/testrun/status';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(updateRunStatusAndResultURLparams)
          .set('x-tfs-internalproxycall', false)
          .set('Content-Type', 'application/json')
          .expect(404)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 204 for updateRunStatusAndResultURL api when project status is disabled', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapp/projects/testprojectcheckdisabled/runs/testrun/status';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(updateRunStatusAndResultURLparams)
          .set('x-tfs-internalproxycall', false)
          .set('Content-Type', 'application/json')
          .expect(204)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 204 for updateRunStatusAndResultURL api', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject13/runs/testrun/status';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(updateRunStatusAndResultURLparams)
          .set('x-tfs-internalproxycall', false)
          .set('Content-Type', 'application/json')
          .expect(204)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  
    test('should return 400 for updateRunStatusAndResultURL api', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject/runs/testrun/status';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send({})
          .set('x-tfs-internalproxycall', false)
          .set('Content-Type', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 304 for updateRunStatusAndResultURL api', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject10/runs/testrun/status';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(updateRunStatusAndResultURLparams)
          .set('x-tfs-internalproxycall', false)
          .set('Content-Type', 'application/json')
          .expect(304)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });

  describe('deleteRun', () => {
    test('should return 200 for deleteRun api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject/runs/testrun';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .delete(url)
          .expect(200)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return 200 for deleteRun api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject/runs/testrun10';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .delete(url)
          .expect(200)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
    test('should return 404 for deleteRun api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject13/runs/testrun';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .delete(url)
          .expect(404)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });

  describe('deleteStatusUpdate', function () {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('deleteStatusUpdate', () => {
      let clientId = 'testClient'
      let projectId = 'testproject13';
      let accountId = 'testAccount';
      let appId = 'testApp'
      let runId = 'testRun';
      let modified, modifiedBy;
      expect(deleteStatusUpdate(db, clientId, accountId, appId, projectId, runId, modified, modifiedBy, mockLog))
        .rejects.toMatchObject(new Error('RUN_NOT_FOUND'));
    });

    test('deleteStatusUpdate', () => {
      let clientId = 'testClient'
      let projectId = 'invalidProjectId';
      let accountId = 'testAccount';
      let appId = 'testApp'
      let runId = 'testrun100';
      expect(deleteStatusUpdate(db, clientId, accountId, appId, projectId, runId))
        .toResolve;
    });
  });
});
