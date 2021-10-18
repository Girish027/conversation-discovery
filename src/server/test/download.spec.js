const assert = require('assert'),
  request = require('supertest'),
  TestUtil = require('./test-util');

describe('Test download spec', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const makeAndStartServerWithMockDB = TestUtil.makeAndStartServerWithMockDB;
  beforeEach(() => {
    TestUtil.restoreConfig();
  });

  describe('Test download spec', () => {
    // TODO: mock the zip file in file utils
    test('should return 200 for download result', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1/runs/testrun/results';
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

    test('should return 403 for download system related result', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-three/runs/testrun/results';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(403)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 404 for download result when caa does not exist', (done) => {
      const url = '/conversationdiscovery/clients/invalidClient/accounts/testaccount/applications/testapp/projects/pro-1/runs/testrun/results';
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

    test('should return 404 for download result when run does not exist', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testProject/runs/run-1/results';
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

    test('should return 404 for download result when run status is not complete', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testProject/runs/testrunincomplete/results';
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

    test('should return 404 for download result when fails to download the file', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testProject/runs/testrunwithresultnull/results';
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

    test('should return 404 for download result when fails to download the file', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-four/runs/testrunwithresultnull/results';
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

  // TODO: Fix this test since it is not able to find this api
  test('should return 200 for download template', (done) => {
    const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/templates';
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
});