/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
const assert = require('assert'),
  request = require('supertest'),
  TestUtil = require('./test-util');
const validateDataset = require('../lib/validate-dataset');
const validateLimit = require('../lib/validate-limit');
const ObjectUtils = require('../lib/utils/object-utils');
const { systemTestProject, systemTestProjects } = require('./test-configs');

jest.mock('../lib/validate-dataset');

describe('Test projects spec', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  const makeAndStartServerWithMockDB = TestUtil.makeAndStartServerWithMockDB;
  beforeEach(() => {
    TestUtil.restoreConfig();
    validateDataset.isDatasetValid = jest.fn();
    validateDataset.maskPIIData = jest.fn();
    validateLimit.checkProjectLimit = jest.fn();
    ObjectUtils.isUndefinedOrNull = jest.fn();
    jest.setTimeout(30000);
  });

  describe('createProject', () => {
    test('should return 400 for create system project api when data is not found', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapps/systemprojects/';
      ObjectUtils.isUndefinedOrNull.mockReturnValue(true);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(systemTestProjects)
          .set('x-tfs-internalproxycall', false)
          .set('Accept', 'application/json')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 500 for create system project api when file is not found', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapp/systemprojects/';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(systemTestProject)
          .set('x-tfs-internalproxycall', false)
          .set('Accept', 'application/json')
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 500 for create system project api when masked file doesnot exist', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/testapp/systemprojects/';
      validateDataset.maskPIIData.mockReturnValue({path: 'testFile'})
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(systemTestProject)
          .set('x-tfs-internalproxycall', false)
          .set('Accept', 'application/json')
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 500 for create system project api', (done) => {
      const url = '/conversationdiscovery/trusted/clients/testclient/accounts/testaccount/applications/checkApp/systemprojects/';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(systemTestProject)
          .set('x-tfs-internalproxycall', false)
          .set('Accept', 'application/json')
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 500 for create project api when file is not provided', (done) => {
      const url = '/conversationdiscovery/trusted/clients/invalidClient/accounts/testaccount/applications/testapp/systemprojects/';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(systemTestProject)
          .set('x-tfs-internalproxycall', false)
          .set('Accept', 'application/json')
          .expect(500)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });
});