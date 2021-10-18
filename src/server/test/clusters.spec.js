/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */

const assert = require('assert'),
  request = require('supertest'),
  TestUtil = require('./test-util');

describe('Test clusters spec', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const makeAndStartServerWithMockDB = TestUtil.makeAndStartServerWithMockDB;
  beforeEach(() => {
    TestUtil.restoreConfig();
    jest.setTimeout(30000);
  });

  // TODO: test acse to create clusters. 

  describe('Clusters', () => {

    describe('getAllClusters', () => {
      test('should return 200 for get-all clusters api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters';
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

      test('should return 500 for get-all clusters api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-11/clusters';
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

      test('should return 500 for get-all clusters api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-12/clusters';
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

    describe('updateCluster', () => {
      test('should return 204 for update clusters api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/cd0e48153a9d6ff820d24c6978f206a601583920652497';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .patch(url)
            .set('Content-Type', 'application/json')
            .expect(204)
            .end((err) => {
              assert(!err, err);
              server.close('die');
              done();
            });
        });
      });
      test('should return 204 for update clusters api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/cd0e48153a9d6ff820d24c6978f206a601583920652497';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .patch(url)
            .send({type: 'clusterName', clusterName: 'test', clusterDescription: 'test'})
            .set('Content-Type', 'application/json')
            .expect(204)
            .end((err) => {
              assert(!err, err);
              server.close('die');
              done();
            });
        });
      });
      test('should return 204 for update clusters api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/clusters/cd0e48153a9d6ff820d24c6978f206a601583920652497';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .patch(url)
            .send({type: 'finalize', clusterName: 'test', clusterDescription: 'test'})
            .set('Content-Type', 'application/json')
            .expect(204)
            .end((err) => {
              assert(!err, err);
              server.close('die');
              done();
            });
        });
      });
      test('should return 500 for update clusters api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-01/clusters/cd0e48153a9d6ff820d24c6978f206a601583920652497';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .patch(url)
            .send({type: 'finalize', clusterName: 'test', clusterDescription: 'test'})
            .set('Content-Type', 'application/json')
            .expect(500)
            .end((err) => {
              assert(!err, err);
              server.close('die');
              done();
            });
        });
      });

      test('should return 500 for update clusters api', (done) => {
        const url = '/conversationdiscovery/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-12/clusters/cd0e48153a9d6ff820d24c6978f206a601583920652497';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .patch(url)
            .send({type: 'finalize', clusterName: 'test', clusterDescription: 'test'})
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

    describe('ingestClusterDataAndUpdateStatus', () => {
      test('should return 204 for ingestClusterDataAndUpdateStatus api', (done) => {
        const url = '/conversationdiscovery/trusted/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/run-1/ingesttoes';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .patch(url)
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

      test('should return 404 for ingestClusterDataAndUpdateStatus api', (done) => {
        const url = '/conversationdiscovery/trusted/clients/validclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/TestRunErr/ingesttoes';
        makeAndStartServerWithMockDB((server, httpServer) => {
          request(httpServer)
            .patch(url)
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
    });


  });
});
