import DataLayer from '../lib/data-layer';
import mysqlConnector from '../lib/mysql-connector';
import mockLog from '../lib/__mocks__/logger';

const { testCAAId, testProject, testProjects, testCAA, testRun, testRuns, 
  updateResponse, testCreateRunReturnObj, validProjectStatus, invalidProjectStatus, testCreateRunReturnObject_2,
  validRunStatus_READY, validRunStatus_COMPLETE, invalidRunStatus, runCount, projCount, projDataSetURL, runResultURL } = require('./test-configs');
const constants = require('../lib/constants');
let dataLayer;
jest.mock('../lib/mysql-connector');

describe('data-layer: CAA related tests', function () {
  beforeAll(() => {
    dataLayer = new DataLayer(mysqlConnector, mockLog);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('getCAAID', function () {
    test('should return CAAid', async () => {
      mysqlConnector.executeQuery.mockReturnValue(testCAAId);
      const caa = await dataLayer.getCAAid(testCAA.client, testCAA.account, testCAA.app);
      expect(caa).toEqual(1);
    });
  
    test('should return empty list for getCAAid', async () => {
      mysqlConnector.executeQuery.mockReturnValue([]);
      const caa = await dataLayer.getCAAid(testCAA.client, testCAA.account, testCAA.app);
      expect(caa).toEqual(null);
    });
  
    test('should throw error when execute query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getCAAid(testCAA.client, testCAA.account, testCAA.app))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });
  });

  describe('createNewCAAid', function () {
    test('should create new CAAid', () => {
      mysqlConnector.executeQuery.mockReturnValue(testCAA);
      expect(dataLayer.createNewCAAid(testCAA.client, testCAA.account, testCAA.app)).resolves.toEqual(testCAA.caaId);
    });

    test('should throw error when execute query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
      });
      expect(dataLayer.createNewCAAid(testCAA.client, testCAA.account, testCAA.app))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    test('should throw error when execute query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        const err = new Error(constants.DB_ERROR_CODES.ER_DUP_ENTRY);
        err.code = constants.DB_ERROR_CODES.ER_DUP_ENTRY;
        throw err;
      });
      expect(dataLayer.createNewCAAid(testCAA.client, testCAA.account, testCAA.app))
        .rejects.toMatchObject(new Error(constants.ERRORS.CAA_ALREADY_EXISTS));
    });
  });

});

describe('data-layer', function () {
  beforeAll(() => {
    dataLayer = new DataLayer(mysqlConnector, mockLog);
    dataLayer.getCAAid = jest.fn();
    dataLayer.buildUpdateProjectQuery = jest.fn();
    dataLayer.buildUpdateRunQuery = jest.fn();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  
  describe('createProject', function () {
    test('should create a new project', () => {
      mysqlConnector.executeQuery.mockReturnValue(testProject);
      expect(dataLayer.createProject(
        testProject.projectId, 'client', 'account', 'appId', testProject.projectName, 'SYSTEM', testProject.datasetName, '', testProject.createdBy, testProject.projectStatus, testProject.created, testProject.datasetURL, testProject.caaId
      )).resolves.toEqual(undefined);
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
      });
      expect(dataLayer.createProject(
        testProject.projectId, 'client', 'account', 'appId', testProject.projectName, 'SYSTEM', testProject.datasetName, testProject.projectDescription, testProject.createdBy, testProject.projectStatus, testProject.created, testProject.datasetURL, testProject.caaId
      )).rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        const err = new Error(constants.DB_ERROR_CODES.ER_DUP_ENTRY);
        err.code = constants.DB_ERROR_CODES.ER_DUP_ENTRY;
        throw err;
      });
      expect(dataLayer.createProject(
        testProject.projectId, 'client', 'account', 'appId', testProject.projectName, 'SYSTEM', testProject.datasetName, testProject.projectDescription, testProject.createdBy, testProject.projectStatus, testProject.created, testProject.datasetURL, testProject.caaId
      )).rejects.toMatchObject(new Error(constants.ERRORS.PROJECT_ALREADY_EXISTS));
    });
  });

  describe('checkIfProjectValid', function () {
    test('should return true for enabled project', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(validProjectStatus);
      expect(dataLayer.checkIfProjectValid('clientId', 'accountId', 'appId', 'projectId')).resolves.toEqual(true);
    });

    test('should return false for disabled project', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(invalidProjectStatus);
      expect(dataLayer.checkIfProjectValid('clientId', 'accountId', 'appId', 'projectId')).resolves.toEqual(false);
    });

    test('should return false for null response', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(null);
      expect(dataLayer.checkIfProjectValid('clientId', 'accountId', 'appId', 'projectId')).resolves.toEqual(false);
    });
    
    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.checkIfProjectValid('clientId', 'accountId', 'appId', 'projectId')).resolves.toEqual(false);
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      mysqlConnector.executeQuery.mockReturnValue(validProjectStatus);
      expect(dataLayer.checkIfProjectValid('clientId', 'accountId', 'appId', 'projectId')).rejects.toMatchObject(new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS));
    });
  });

  describe('getRunCountForProject', function () {
    test('should return number of runs for given project', () => {
      mysqlConnector.executeQuery.mockReturnValue(runCount);
      expect(dataLayer.getRunCountForProject('projectId')).resolves.toEqual(19);
    });

    test('should throw error when execute query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getRunCountForProject('projectId')).rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

  });

  describe('getProjectCountForCAA', function () {
    test('should return number of enabled projects for given CAA', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(projCount);
      expect(dataLayer.getProjectCountForCAA('clientId', 'accountId', 'appId', true)).resolves.toEqual(10);
    });

    test('should return number of all projects for given CAA', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(projCount);
      expect(dataLayer.getProjectCountForCAA('clientId', 'accountId', 'appId', false)).resolves.toEqual(10);
    });

    test('should return number of projects as ZERO if CAA does not exist', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      mysqlConnector.executeQuery.mockReturnValue(projCount);
      expect(dataLayer.getProjectCountForCAA('clientId', 'accountId', 'appId', true)).resolves.toEqual(0);
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getProjectCountForCAA('clientId', 'accountId', 'appId', true)).rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

  });

  describe('getDatasetURL', function () {
    test('should return dataset URL', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(projDataSetURL);
      expect(dataLayer.getDatasetURL('clientId', 'accountId', 'appId', 'projectId')).resolves.toEqual('DATASET_TEST_URL');
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      mysqlConnector.executeQuery.mockReturnValue(projDataSetURL);
      expect(dataLayer.getDatasetURL('clientId', 'accountId', 'appId', 'projectId')).rejects.toMatchObject(new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS));
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getDatasetURL('clientId', 'accountId', 'appId', 'projectId')).rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });
  });

  describe('getResultURL', function () {
    test('should return result URL', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(runResultURL);
      expect(dataLayer.getResultURL('clientId', 'accountId', 'appId', 'projectId', 'runId')).resolves.toEqual('RESULT_URL');
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      mysqlConnector.executeQuery.mockReturnValue(runResultURL);
      expect(dataLayer.getResultURL('clientId', 'accountId', 'appId', 'projectId', 'runId')).rejects.toMatchObject(new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS));
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getResultURL('clientId', 'accountId', 'appId', 'projectId', 'runId')).rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    test('should throw error when result url is empty', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(undefined);
      expect(dataLayer.getResultURL('clientId', 'accountId', 'appId', 'projectId', 'runId')).rejects.toMatchObject(new Error(constants.ERRORS.RUN_NOT_FOUND));
    });
  });

  describe('checkIfRunValid', function () {
    test('should return true for run status READY', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(validRunStatus_READY);
      expect(dataLayer.checkIfRunValid('clientId', 'accountId', 'appId', 'projectId', 'runId')).resolves.toEqual(true);
    });

    test('should return true for run status COMPLETE', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(validRunStatus_COMPLETE);
      expect(dataLayer.checkIfRunValid('clientId', 'accountId', 'appId', 'projectId', 'runId')).resolves.toEqual(true);
    });

    test('should return false for run status QUEUED', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(invalidRunStatus);
      expect(dataLayer.checkIfRunValid('clientId', 'accountId', 'appId', 'projectId', 'runId')).resolves.toEqual(false);
    });

    test('should return false for null response', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(null);
      expect(dataLayer.checkIfRunValid('clientId', 'accountId', 'appId', 'projectId', 'runId')).resolves.toEqual(false);
    });
    
    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      mysqlConnector.executeQuery.mockReturnValue(validProjectStatus);
      expect(dataLayer.checkIfRunValid('clientId', 'accountId', 'appId', 'projectId', 'runId')).rejects.toMatchObject(new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS));
    });
  });

  describe('getProjects', function () {
    test('should return list of projects', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(testProjects);
      expect(dataLayer.getProjects(testCAA.client, testCAA.account, testCAA.app, true)).resolves.toEqual(testProjects);
    });

    test('should return empty when caaid is null', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      mysqlConnector.executeQuery.mockReturnValue(testProjects);
      expect(dataLayer.getProjects(testCAA.client, testCAA.account,
        testCAA.app, true)).resolves
        .toMatchObject([]);
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getProjects(testCAA.client, testCAA.account, testCAA.app, true)).rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getProjects(testCAA.client, testCAA.account, testCAA.app, false)).rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });
  });

  describe('updateProject', function () {
    beforeEach(() => {
      dataLayer.buildUpdateProjectQuery.mockReturnValue('some query');
    });

    test('should update the project', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(updateResponse);
      expect(dataLayer.updateProject(testCAA.client, testCAA.account,
        testCAA.app, testProject.projectName, testProject.projectDescription)).resolves
        .toEqual(true);
    });

    test('should throw error when caaid is null', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      expect(dataLayer.updateProject(testCAA.client, testCAA.account,
        testCAA.app, testProject.projectName, testProject.projectDescription)).rejects
        .toMatchObject(new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS));
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.updateProject(testCAA.client, testCAA.account,
        testCAA.app, testProject.projectName, testProject.projectDescription))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    test('should throw error when execute query fails due to duplicate entry', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        const err = new Error(constants.DB_ERROR_CODES.ER_DUP_ENTRY);
        err.code = constants.DB_ERROR_CODES.ER_DUP_ENTRY;
        throw err;
      });
      expect(dataLayer.updateProject(testCAA.client, testCAA.account,
        testCAA.app, testProject.projectName, testProject.projectDescription))
        .rejects.toMatchObject(new Error(constants.ERRORS.CAA_ALREADY_EXISTS));
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('deleteProject', function () {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('should disable the project', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(updateResponse);
      expect(dataLayer.deleteProject(testCAA.client, testCAA.account, testCAA.app, testProject.projectId)).resolves.toEqual(true);
    });

    test('should throw error when caaid is null', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      expect(dataLayer.deleteProject(testCAA.client, testCAA.account, testCAA.app,
        testProject.projectId)).rejects
        .toMatchObject(new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS));
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.deleteProject(testCAA.client, testCAA.account, testCAA.app,
        testProject.projectId))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('getProject', function () {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('should return a project', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(testProjects);
      expect(dataLayer.getProject(testCAA.client, testCAA.account, testCAA.app)).resolves.toEqual(testProject);
    });

    test('should throw error when caaid is null', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      mysqlConnector.executeQuery.mockReturnValue(testProject);
      expect(dataLayer.getProject(testCAA.client, testCAA.account, testCAA.app)).rejects
        .toMatchObject(new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS));
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getProject(testCAA.client, testCAA.account, testCAA.app))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => null);
      expect(dataLayer.getProject(testCAA.client, testCAA.account, testCAA.app))
        .resolves.toEqual(null);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('getProjectByName', function () {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('should return a project', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(testProjects);
      expect(dataLayer.getProjectByName(testCAA.client, testCAA.account, testCAA.app)).resolves.toEqual(testProject);
    });

    test('should throw error when caaid is null', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      mysqlConnector.executeQuery.mockReturnValue(testProject);
      expect(dataLayer.getProjectByName(testCAA.client, testCAA.account, testCAA.app)).rejects
        .toMatchObject(new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS));
    });

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getProjectByName(testCAA.client, testCAA.account, testCAA.app))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    test('should throw error when execute query returns empty or null', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => null);
      expect(dataLayer.getProjectByName(testCAA.client, testCAA.account, testCAA.app))
        .resolves.toEqual(null);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('updateProjectModifiedDetails', function () {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('should return a project', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockReturnValue(testProjects);
      expect(dataLayer.updateProjectModifiedDetails(testProject.projectId, testProject.modified, testProject.modifiedBy)).resolves
        .toEqual(true);});

    test('should throw error when query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.updateProjectModifiedDetails(testProject.projectId, testProject.modified, testProject.modifiedBy))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });
    
    afterEach(() => {
      jest.clearAllMocks();
    });
  });
  describe('getRun', function () {
    test('should return a run', () => {
      mysqlConnector.executeQuery.mockReturnValue([testRun]);
      expect(dataLayer.getRun(testRun.projectId, testRun.runId)).resolves.toEqual(testRun);
    });

    // TODO test to check if projectId is null after validate run in datalayer

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getRun(testRun.projectId, testRun.runId))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    test('should throw error when execute query returns empty or null', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => null);
      expect(dataLayer.getRun(testRun.projectId, testRun.runId))
        .resolves.toEqual(null);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('getAllRunsForAProject', function () {
    test('should return runs', () => {
      mysqlConnector.executeQuery.mockReturnValue(testRuns);
      expect(dataLayer.getAllRunsForAProject(testRun.projectId)).resolves.toEqual(testRuns);
    });

    // TODO test to check if projectId is null after validate run in datalayer

    test('should throw error when execute query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.getAllRunsForAProject(testRun.projectId))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('updateRun', function () {
    beforeEach(() => {
      dataLayer.buildUpdateRunQuery.mockReturnValue('some query');
    });

    test('should update the run', () => {
      mysqlConnector.executeQuery.mockReturnValue(updateResponse);
      expect(dataLayer.updateRun(testCAA.client, testCAA.account,
        testCAA.app, testRun.runName, testRun.runDescription)).resolves
        .toEqual(true);
    });

    test('should fail as query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        const err = new Error(constants.DB_ERROR_CODES.ER_DUP_ENTRY);
        err.code = constants.DB_ERROR_CODES.ER_DUP_ENTRY;
        throw err;
      });
      expect(dataLayer.updateRun(testCAA.client, testCAA.account,
        testCAA.app, testRun.runName, testRun.runDescription))
        .rejects.toMatchObject(new Error(constants.ERRORS.RUN_ALREADY_EXISTS));
    });

    // TODO test to check if projectId is null after validate run in datalayer

    test('should throw error when execute query fails', () => {
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.updateRun(testCAA.client, testCAA.account,
        testCAA.app, testRun.runName, testRun.runDescription))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('createRun', function () {
    test('should create a run', () => {
      mysqlConnector.executeQuery.mockReturnValue(testCreateRunReturnObj);
      expect(dataLayer.createRun(testCreateRunReturnObj)).resolves.toEqual(undefined);
    });

    // TODO test to check if projectId is null after validate run in datalayer

    test('should throw error when execute query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.createRun(testCreateRunReturnObj.runId, testCreateRunReturnObj.client, testCreateRunReturnObj.account, testCreateRunReturnObj.app, 
        testCreateRunReturnObj.projectId, testCreateRunReturnObj.runName, testCreateRunReturnObj.runDescription, 
        testCreateRunReturnObj.numOfClusters, testCreateRunReturnObj.numOfTurns, testCreateRunReturnObj.stopWords, 
        testCreateRunReturnObj.created, testCreateRunReturnObj.createdBy, testCreateRunReturnObj.modified, testCreateRunReturnObj.modifiedBy, 
        testCreateRunReturnObj.runStatus, testCreateRunReturnObj.runStatusDescription, testCreateRunReturnObj.starred))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    test('should throw error when execute query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        const err = new Error(constants.DB_ERROR_CODES.ER_DUP_ENTRY);
        err.code = constants.DB_ERROR_CODES.ER_DUP_ENTRY;
        throw err;
      });
      expect(dataLayer.createRun(testCreateRunReturnObj.runId, testCreateRunReturnObj.client, testCreateRunReturnObj.account, testCreateRunReturnObj.app, 
        testCreateRunReturnObj.projectId, testCreateRunReturnObj.runName, testCreateRunReturnObj.runDescription, 
        testCreateRunReturnObj.numOfClusters, testCreateRunReturnObj.numOfTurns, testCreateRunReturnObj.stopWords, 
        testCreateRunReturnObj.created, testCreateRunReturnObj.createdBy, testCreateRunReturnObj.modified, testCreateRunReturnObj.modifiedBy, 
        testCreateRunReturnObj.runStatus, testCreateRunReturnObj.runStatusDescription, testCreateRunReturnObj.starred))
        .rejects.toMatchObject(new Error(constants.ERRORS.RUN_ALREADY_EXISTS));
    });

    test('should throw error when execute query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        const err = new Error(constants.DB_ERROR_CODES.ER_NO_REFERENCED_ROW_2);
        err.code = constants.DB_ERROR_CODES.ER_NO_REFERENCED_ROW_2;
        throw err;
      });
      expect(dataLayer.createRun(testCreateRunReturnObj.runId, testCreateRunReturnObj.client, testCreateRunReturnObj.account, testCreateRunReturnObj.app, 
        testCreateRunReturnObj.projectId, testCreateRunReturnObj.runName, testCreateRunReturnObj.runDescription, 
        testCreateRunReturnObj.numOfClusters, testCreateRunReturnObj.numOfTurns, testCreateRunReturnObj.stopWords, 
        testCreateRunReturnObj.created, testCreateRunReturnObj.createdBy, testCreateRunReturnObj.modified, testCreateRunReturnObj.modifiedBy, 
        testCreateRunReturnObj.runStatus, testCreateRunReturnObj.runStatusDescription, testCreateRunReturnObj.starred))
        .rejects.toMatchObject(new Error(constants.ERRORS.PROJECT_NOT_FOUND));
    });

    test('should create a run', () => {
      dataLayer.getCAAid.mockReturnValue(null);
      expect(dataLayer.createRun(testCreateRunReturnObj))
        .rejects.toMatchObject(new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('deleteRun', function () {
    test('should delete a run', () => {
      mysqlConnector.executeQuery.mockReturnValue(updateResponse);
      expect(dataLayer.deleteRun(testCAA.client, testCAA.account,
        testCAA.app, testRun.projectId, testRun.runId)).resolves.toEqual(true);
    });

    // TODO test to check if projectId is null after validate run in datalayer

    test('should throw error when execute query fails', () => {
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.deleteRun(testCAA.client, testCAA.account,
        testCAA.app, testRun.projectId, testRun.runId))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('checkIfRunValid', function () {
    test('should check if a run is valid', () => {
      const testValidRun = testRuns('READY', 'result url');
      mysqlConnector.executeQuery.mockReturnValue(testValidRun);
      expect(dataLayer.checkIfRunValid(testValidRun.client, testValidRun.account, testValidRun.app, testValidRun.projectId, testValidRun.runId)).resolves.toEqual(true);
    });

    test('should throw error when execute query fails', () => {
      const testValidRun = testRuns('READY', 'result url');
      dataLayer.getCAAid.mockReturnValue(1);
      mysqlConnector.executeQuery.mockImplementation(() => {
        throw new Error();
      });
      expect(dataLayer.checkIfRunValid(testValidRun.client, testValidRun.account, testValidRun.app, testValidRun.projectId, testValidRun.runId))
        .rejects.toMatchObject(new Error(constants.ERRORS.DB_CONNECTION_ERROR));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('buildUpdateProjectQuery', function () {
    beforeAll(() => {
      jest.clearAllMocks();
      dataLayer = new DataLayer(mysqlConnector, mockLog);
    });
    test('should return a query', () => {
      const patchParametersToBeUpdated = {};
      patchParametersToBeUpdated.projectName = 'testproject';
      patchParametersToBeUpdated.modified = 2192338409390;
      expect(dataLayer.buildUpdateProjectQuery(patchParametersToBeUpdated, 'project', testCAA.caaId, testProject.projectId)).toEqual('UPDATE project SET projectName = \'testproject\',modified = 2192338409390 WHERE caaId = \'testclient-testaccount-testapp\' AND projectId = \'ahSaduhawukeh\'');
    });

    test('should return a query', () => {
      const patchParametersToBeUpdated = {};
      try {
        dataLayer.buildUpdateProjectQuery(patchParametersToBeUpdated, 'project', testCAA.caaId, testProject.projectId);
      } catch (e) {
        expect(e.message).toBe(constants.ERRORS.BODY_PARAMETERS_MISSING);
      }

    });

    test('should return a query', () => {
      const patchParametersToBeUpdated = {};
      patchParametersToBeUpdated.projectName = 'testproject';
      patchParametersToBeUpdated.modified = true;
      try {
        dataLayer.buildUpdateProjectQuery(patchParametersToBeUpdated, 'project', testCAA.caaId, testProject.projectId);
      } catch (e) {
        expect(e.message).toBe(constants.ERRORS.QUERY_BUILDER_DATA_TYPE_NOT_SUPPORTED);
      }
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('buildUpdateRunQuery', function () {
    beforeAll(() => {
      jest.clearAllMocks();
      dataLayer = new DataLayer(mysqlConnector, mockLog);
    });
    test('should return a query', () => {
      const patchParametersToBeUpdated = {};
      patchParametersToBeUpdated.runName = 'testRun';
      patchParametersToBeUpdated.modified = 2192338409390;
      expect(dataLayer.buildUpdateRunQuery(patchParametersToBeUpdated, 'run', testCAA.caaId, testProject.projectId)).toEqual('UPDATE run SET runName = \'testRun\',modified = \'2192338409390\' WHERE runId = \'ahSaduhawukeh\' AND projectId = \'testclient-testaccount-testapp\'');
    });

    test('should return a query', () => {
      const patchParametersToBeUpdated = {};
      try {
        dataLayer.buildUpdateRunQuery(patchParametersToBeUpdated, 'project', testCAA.caaId, testProject.projectId);
      } catch (e) {
        expect(e.message).toBe(constants.ERRORS.BODY_PARAMETERS_MISSING);
      }

    });

    test('should return a query', () => {
      const patchParametersToBeUpdated = {};
      patchParametersToBeUpdated.projectName = 'testproject';
      patchParametersToBeUpdated.modified = true;
      try {
        dataLayer.buildUpdateRunQuery(patchParametersToBeUpdated, 'project', testCAA.caaId, testProject.projectId);
      } catch (e) {
        expect(e.message).toBe(constants.ERRORS.QUERY_BUILDER_DATA_TYPE_NOT_SUPPORTED);
      }
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });
});
