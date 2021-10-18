/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
const assert = require('assert'),
  request = require('supertest'),
  TestUtil = require('./test-util');
const testFile = __dirname + '/test-postman-data.csv';
const validateDataset = require('../lib/validate-dataset');
const validateLimit = require('../lib/validate-limit');
const {testProject, testProjects, testPatchParametersForProject, testPatchParametersForProjects, emptyPatchParameters} = require('./test-configs');
const project = require('../controllers/projects')

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
    jest.setTimeout(30000);
  });

  describe('createProject', () => {
    test('should return 415 for create project api when file is not provided', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .send(testProject)
          .set('Accept', 'application/json')
          .expect(415)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test.skip('should return 200 for create project api ', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/';
      validateDataset.isDatasetValid.mockReturnValue(true);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .field('projectName', 'testproject')
          .field('datasetName', 'testdataset')
          .attach('upfile', testFile)
          .set('Content-Type', 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbTL')
          .expect(200)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create project api when datasetname is not provided', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/';
      validateDataset.maskPIIData.mockReturnValue({path: 'testFile'})
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .field('projectName', 'testproject')
          .field('datasetName', 'testdataset')
          .set('Content-Type', 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbTL')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create project api when projectname is not provided', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/';
      validateDataset.maskPIIData.mockReturnValue({path: 'testFile'})
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .field('datasetName', 'testdataset')
          .attach('upfile', testFile)
          .set('Content-Type', 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbTL')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 500 for create project api when createproject fails to save in database', (done) => {
      const url = '/conversationdiscovery/clients/dummy/accounts/testaccount/applications/testapp/projects/';
      validateLimit.checkProjectLimit.mockReturnValue(true);
      validateDataset.maskPIIData.mockReturnValue({path: 'testFile'});
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .field('datasetName', 'testdataset')
          .field('projectName', 'testproject')
          .attach('upfile', testFile)
          .set('Content-Type', 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbTL')
          .expect(500)
          .end((err,) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create project api whenn projectLimit is exceeded', (done) => {
      const url = '/conversationdiscovery/clients/dummy/accounts/testaccount/applications/testapp/projects/';
      validateLimit.checkProjectLimit.mockReturnValue(false);
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .field('datasetName', 'testdataset')
          .field('projectName', 'testproject')
          .attach('upfile', testFile)
          .set('Content-Type', 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbTL')
          .expect(400)
          .end((err,) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 403 for create project api when createproject for system', (done) => {
      const url = '/conversationdiscovery/clients/dummy/accounts/testaccount/applications/testapp/projects/';
      validateLimit.checkProjectLimit.mockReturnValue(true);
      validateDataset.maskPIIData.mockReturnValue({path: 'testFile'});
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .field('datasetName', 'testdataset')
          .field('projectName', 'Conversations Analysis')
          .attach('upfile', testFile)
          .set('Content-Type', 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbTL')
          .expect(403)
          .end((err,) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for create project api when dataset is not provided', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .post(url)
          .field('projectName', 'testproject')
          .attach('upfile', testFile)
          .set('Content-Type', 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbTL')
          .expect(400)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });

  describe('getProject', () => {
    test('should return 200 for get projects api', (done) => {
      const url = '/conversationdiscovery/clients/dummy/accounts/testaccount/applications/testapp/projects';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(200)
          .end((err, res) => {
            assert(!err, err);
            expect(res.body).toEqual([]);
            server.close('die');
            done();
          });
      });
    });

    test('should return 200 for get projects api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .get(url)
          .expect(200)
          .end((err, res) => {
            assert(!err, err);
            expect(res.body).toEqual(testProjects);
            server.close('die');
            done();
          });
      });
    });

    test('should return 500 for get projects api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/dummy/projects';
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

  describe('updateProject', () => {
    test('should return 200 for update project api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(testPatchParametersForProject)
          .set('Content-Type', 'application/json')
          .expect(200)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 409 for update project api when project name changed to same', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(testPatchParametersForProject)
          .set('Content-Type', 'application/json')
          .expect(409)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 400 for update project api when path parameters are not provided', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1';
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

    test('should return 409 for update project api when get project fails', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject1';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(testPatchParametersForProject)
          .set('Content-Type', 'application/json')
          .expect(409)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 200 for update project api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-1';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(testPatchParametersForProjects)
          .set('systemaccess','false')
          .set('Content-Type', 'application/json')
          .expect(403)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });

    test('should return 404 for update project api when get project fails', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testprojectcheck';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .patch(url)
          .send(testPatchParametersForProject)
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

  describe('deleteProject', () => {
    test('should return 200 for delete project api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-one';
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

    test('should return 200 for delete project api', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/pro-two';
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

    test('should return 404 for delete project api when project does not exist', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testprojectcheck';
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

    test('should return 409 for delete project api when caa does not exist', (done) => {
      const url = '/conversationdiscovery/clients/testclient/accounts/testaccount/applications/testapp/projects/testproject1';
      makeAndStartServerWithMockDB((server, httpServer) => {
        request(httpServer)
          .delete(url)
          .expect(409)
          .end((err) => {
            assert(!err, err);
            server.close('die');
            done();
          });
      });
    });
  });

  describe('patchParameters', function () {
    test('patch params', () => {
      let projectName = 'testProject';
      let modified = '1000000';
      let modifiedBy = 'local';
      expect(project.patchParameters(projectName, modified, modifiedBy)).toEqual({
       
        modified: '1000000',
        modifiedBy: 'local',
        projectName: 'testProject_DELETE_1000000',
        projectStatus: 'DISABLED'
         
      });
    });

  });

  describe('validateProjectName', function () {
    test('validateProjectName', () => {
      expect(() => { 
        project.validateProjectName('Conversations Analysis'); 
      })
        .toThrow('CREATE_PERMISSION_DENIED');   
    });
  });
});