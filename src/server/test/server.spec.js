/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

jest.mock('@okta/oidc-middleware');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const { testClientConfigsRes, testClientConfigs } = require('./test-configs');

const assert = require('assert'),
  axios = require('axios'),
  request = require('supertest'),
  fs = require('fs'),
  nock = require('nock'),
  TestUtil = require('./test-util'),
  { basePath } = require('../api/swagger'),
  makeAndStartServer = TestUtil.makeAndStartServer;

import { addRetryInterceptor } from '../lib/utils/axios-utils';

jest.mock('axios', () => jest.fn());
jest.mock('../lib/utils/axios-utils', () => ({
  addRetryInterceptor: jest.fn()
}));

describe('server', () => {
  beforeAll(() => {
    fs.writeFileSync(TestUtil.getHeartbeatPath(), 'OK');
    ExpressOIDC.mockImplementation(() => ({
      router: (req, res, next) => {
        next();
      },
      ensureAuthenticated: () => (req, res, next) => {
        req.isSecurityEnabled = true;
        req.userContext = {
          userinfo: {
            clients: ['not_*', 'some_client'],
            groups: ['not_IAT_INTERNAL']
          }
        };
        next();
      }
    }));
  });

  beforeEach(() => { // eslint-disable-line no-undef
    TestUtil.restoreConfig();
  });

  afterEach(() => {
    const pendingMocks = nock.pendingMocks();
    assert(!pendingMocks.length, pendingMocks);
  });

  afterAll(() => {
    nock.restore();
  });

  test('should start and stop the server', (done) => {
    makeAndStartServer((server, httpServer) => {
      assert(server, 'server');
      assert(httpServer, 'httpServer');
      server.close('die');
      done();
    });
  });

  test('should GET health', (done) => {
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get('/v1/health')
        .expect(200)
        .end((err, res) => {
          assert(!err, err);
          assert.equal(res.type, 'text/plain');
          assert.equal(res.text, 'OK');
          server.close('die');
          done();
        });
    });
  });

  test('should GET user configuration', (done) => {
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get('/conversationdiscovery/user/config')
        .expect(200)
        .end((err, res) => {
          assert(!err, err);
          assert.equal(res.body.authEnabled, false);
          server.close('die');
          done();
        });
    });
  });

  test('access denied when trying to access trusted flow', (done) => {
    axios.mockResolvedValueOnce();
    addRetryInterceptor.mockReturnValueOnce();
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get('/conversationdiscovery/trusted/Test')
        .expect(401)
        .end((err) => {
          assert(!err, err);
          server.close('die');
          done();
        });
    });
  });

  test('conversations configuration', (done) => {
    axios.mockResolvedValueOnce();
    addRetryInterceptor.mockReturnValueOnce();
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get('/conversationdiscovery/user/conversationsConfig')
        .expect(200)
        .end((err) => {
          assert(!err, err);
          server.close('die');
          done();
        });
    });
  });

  test('Answers configuration', (done) => {
    axios.mockResolvedValueOnce();
    addRetryInterceptor.mockReturnValueOnce();
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get('/conversationdiscovery/user/answersConfig')
        .expect(200)
        .end((err) => {
          assert(!err, err);
          server.close('die');
          done();
        });
    });
  });

  test('should not return any user session', (done) => {
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get('/conversationdiscovery/sessions')
        .expect(400)
        .end((err) => {
          assert(!err, err);
          server.close('die');
          done();
        });
    });
  });

  test('should return a 404 for an invalid route', (done) => {
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get(`${basePath}/foobar`)
        .expect(404)
        .end((err) => {
          assert(!err, err);
          server.close('die');
          done();
        });
    });
  });

  test('should send 400 response when request path contains invalid characters', (done) => {
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get(`${basePath}/foobar/../../pwd`)
        .expect(400)
        .end((err) => {
          assert(!err, err);
          server.close('die');
          done();
        });
    });
  });

  test('should logout and redirect', (done) => {
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get(`${basePath}/logout`)
        .expect(302)
        .end((err, res) => {
          assert(!err, err);
          assert.equal(res.type, 'text/plain');
          assert(/redirecting/.test(res.text.toLowerCase()),
            `expected redirecting message: ${res.text}`);
          server.close('die');
          done();
        });
    });
  });

  test('should logout and redirect', (done) => {
    makeAndStartServer((server, httpServer) => {
      request(httpServer)
        .get(`${basePath}?clientid=247ai&appid=referencebot`)
        .expect(301)
        .end((err, res) => {
          assert(!err, err);
          assert.equal(res.type, 'text/plain');
          assert(/redirecting/.test(res.text.toLowerCase()),
            `expected redirecting message: ${res.text}`);
          server.close('die');
          done();
        });
    });
  });

  test('role Restriction when method is inclusive', (done) => {
    makeAndStartServer((server) => {
      const result = server.roleRestriction(testClientConfigsRes, '247ai', { method: 'POST'});
      assert.strictEqual(result, true);
      server.close('die');
      done();
    });
  });

  test('role Restriction when method is exclusive', (done) => {
    makeAndStartServer((server) => {
      const result = server.roleRestriction(testClientConfigsRes, '247ai', { method: 'GET'});
      assert.strictEqual(result, false);
      server.close('die');
      done();
    });
  });

  test('role Restriction when config data is not given', (done) => {
    makeAndStartServer((server) => {
      const result = server.roleRestriction(undefined, '247ai', { method: 'GET'});
      assert.strictEqual(result, true);
      server.close('die');
      done();
    });
  });

  test('role Restriction when allowedRole is given', (done) => {
    makeAndStartServer((server) => {
      const result = server.roleRestriction(testClientConfigs, '247ai', { method: 'GET'});
      assert.strictEqual(result, false);
      server.close('die');
      done();
    });
  });

  // test('should logout and redirect', (done) => {
  //   makeAndStartServer((server, httpServer) => {
  //     request(httpServer)
  //       .get(`${basePath}`)
  //       .expect(301)
  //       .end((err, res) => {
  //         assert(!err, err);
  //         assert.equal(res.type, 'text/html');
  //         assert(/redirecting/.test(res.text.toLowerCase()),
  //           `expected redirecting message: ${res.text}`);
  //         server.close('die');
  //         done();
  //       });
  //   });
  // });

  test('should close gracefully if config does not log requests', (done) => {
    const rawConfig = TestUtil.getRawConfig();
    assert(rawConfig['request-log']['output-dir']);
    delete rawConfig['request-log']['output-dir'];
    makeAndStartServer((server) => {
      assert(server, 'server');
      server.close('die');
      done();
    });
  });
});
