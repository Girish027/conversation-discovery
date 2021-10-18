'use strict';

const assert = require('assert');
const request = require('supertest');
const TestUtil = require('./test-util');
const { basePath } = require('../api/swagger');

describe('authentications', function() {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const makeAndStartServerWithMockDB = TestUtil.makeAndStartServerWithMockDB;
  beforeEach(() => {
    TestUtil.restoreConfig();
  });

  test('should get caller authenticated userinfo object', (done) => {
    const url = `${basePath}/authentications?self=true`;
    makeAndStartServerWithMockDB((server, httpServer) =>
      request(httpServer)
        .get(url)
        .expect(200)
        .end((err) => {
          if (err) {
            assert(!err, err);
          } 
          server.close('die');
          done();
        })
    );
  });

  test('should fail to get other authenticated userinfo objects', (done) => {
    const url = `${basePath}/authentications?self=false`;
    makeAndStartServerWithMockDB((server, httpServer) =>
      request(httpServer)
        .get(url)
        .expect(400)
        .end((err) => {
          if (err) {
            assert(!err, err);
          } 
          server.close('die');
          done();
        })
    );
  });
});
