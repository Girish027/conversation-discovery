const testFile = __dirname + '/test-postman-data.csv';

const testCAAId = [
  {
    caaID: 1
  }];

const validProjectStatus = [
  {
    projectStatus: 'ENABLED'
  }];

const invalidProjectStatus = [
  {
    projectStatus: 'DISABLED'
  }];

const validRunStatus_READY = [
  {
    runStatus: 'READY'
  }];

const validRunStatus_COMPLETE = [
  {
    runStatus: 'COMPLETE'
  }];

const invalidRunStatus = [
  {
    runStatus: 'QUEUED'
  }];

const runCount = [
  {
    runCount: 19
  }];

const projCount = [
  {
    projCount: 10
  }];

const projDataSetURL = [{
  datasetURL: 'DATASET_TEST_URL'
}];

const runResultURL = [{
  resultURL: 'RESULT_URL'
}];

const testProjects = [
  {
    projectId: 'ahSaduhawukeh',
    caaId: 1,
    projectName: 'Project2',
    datasetName: 'testDataset',
    modified: '2019-06-17T18:36:12.000Z',
    modifiedBy: 'TEST',
    created: '2019-06-17T18:36:12.000Z',
    createdBy: 'as@247-inc.com',
    projectDescription: 'This is a test project3',
    datasetURL: null,
    projectStatus: 'DISABLED',
    statusDescription: null
  }];

const testProject =
  {
    projectId: 'ahSaduhawukeh',
    caaId: 1,
    projectName: 'Project2',
    datasetName: 'testDataset',
    modified: '2019-06-17T18:36:12.000Z',
    modifiedBy: 'TEST',
    created: '2019-06-17T18:36:12.000Z',
    createdBy: 'as@247-inc.com',
    projectDescription: 'This is a test project3',
    datasetURL: null,
    projectStatus: 'DISABLED',
    statusDescription: null
  };

const systemTestProject =
  {
    transcriptURL: 'src/server/test/mocks/sys_id.csv',
    proj_UUID: 'sys_id'
  };

const systemTestProjects =
  {
    transcriptURL: 'src/server/test/mocks/tester.csv',
    proj_UUID: 'tester'
  };

const updateResponse = {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 0,
  serverStatus: 2,
  warningCount: 0,
  message: '(Rows matched: 1  Changed: 1  Warnings: 0',
  protocol41: true,
  changedRows: 1
}

const updateProject =
  {
    projectId: 'ahSaduhawukeh',
    caaId: 1,
    projectName: 'Project2',
    datasetName: 'testDataset',
    modified: '2019-06-17T18:36:12.000Z',
    modifiedBy: 'TEST',
    created: '2019-06-17T18:36:12.000Z',
    createdBy: 'as@247-inc.com',
    projectDescription: 'This is a test project3',
    datasetURL: null,
    projectStatus: 'DISABLED',
    statusDescription: null
  };

const testRun = {
  runId: 'run-3ba4d85a-1506-4332-2582-4532ad388850',
  projectId: 'pro-e58bf69d-f9ac-4df3-c699-9d4d60e9b1d0',
  runName: 'runh4',
  runDescription: '',
  numOfTurns: 3,
  numOfClusters: 300,
  stopWords: '',
  modified: 1562098283434,
  modifiedBy: 'testUser',
  created: '1562098283434',
  createdBy: 'testUser',
  runStatus: 'QUEUED',
  runStatusDescription: 'The run is queued',
  starred: 0
}

const testRunCreateInput = {
  runName: 'testRun',
  user: 'testUser',
  numOfTurns: 2,
  numOfClusters: 100
}

const testRunCreateInputInvalid = {
  runName: 'testRunInvalid',
  user: 'testUser',
  numOfTurns: 2,
  numOfClusters: 100
}

const testPatchParametersForRun = {
  runName: 'renamedTestRun',
  runDescription: 'testUser',
  starred: 0,
  runStatus: 'teststatus',
  runStatusDescription: 'testRunStatus'
}


const testRuns = function(runStatus, resultURL) {
  return [{
    runId: 'run-3ba4d85a-1506-4332-2582-4532ad388850',
    projectId: 'pro-e58bf69d-f9ac-4df3-c699-9d4d60e9b1d0',
    runName: 'runh4',
    runDescription: '',
    numOfTurns: 3,
    numOfClusters: 300,
    stopWords: '',
    modified: 1562098283434,
    modifiedBy: 'testUser',
    created: '1562098283434',
    createdBy: 'testUser',
    runStatus: runStatus,
    runStatusDescription: 'The run is queued',
    starred: 0,
    resultURL: resultURL
  }]
}

const getTestRunWithStatusAndResultUrl = function(runStatus, resultURL) {
  return {
    runId: 'run-3ba4d85a-1506-4332-2582-4532ad388850',
    projectId: 'pro-e58bf69d-f9ac-4df3-c699-9d4d60e9b1d0',
    runName: 'runh4',
    runDescription: '',
    numOfTurns: 3,
    numOfClusters: 300,
    stopWords: '',
    modified: 1562098283434,
    modifiedBy: 'testUser',
    created: '1562098283434',
    createdBy: 'testUser',
    runStatus: runStatus,
    runStatusDescription: 'The run is queued',
    starred: 0,
    resultURL: resultURL
  }
}

const testCreateRunReturnObj = {
  app: 'ghsdi',
  account: 'dsdef',
  client: 'abcdsd',
  projectId: 'pro-e58bf69d-f9ac-4df3-c699-9d4d60e9b1d0',
  runName: 'runh1',
  runId: 'run-7b18b191-36f3-4255-9ddd-ba24b9f00ad0',
  runDescription: '',
  numOfClusters: 300,
  numOfTurns: 3,
  stopWords: '',
  modified: '1562098294080',
  created: '1562098294080',
  runStatus: 'QUEUED',
  runStatusDescription: 'The run is queued',
  starred: 0
}

const testCAA = {
  caaId: 'testclient-testaccount-testapp',
  client: 'testclient',
  account: 'testaccount',
  app: 'testapp'
}

const postParametersForProject = { upfile:
    { value: 'fs.createReadStream("test-postman-data.csv")',
      options:
        { filename: testFile,
          contentType: null } },
projectName: 'testproject',
datasetName: 'testdataset',
projectDescription: 'Test Project' };

const testPatchParametersForProject = {projectName : 'testProject3', projectDescription: 'This is a test project', projectStatus: 'TestStatus'};

const testPatchParametersForProjects = {projectName : 'Conversations Analysis', projectDescription: 'This is a test project'};

const testPatchParametersForProjectStatus = {projectStatus : 'testProject3', projectStatusDescription: 'This is a test project'};

const emptyPatchParameters = {};

const updateRunStatusAndResultURLparams = {runStatus:'QUEUED',
  runStatusDescription:'Postman_Tests',
  resultURL:'Test_Urls',
  numOfClusters: 2
};

const testClientConfigsRes = [{
  clientId: 'tfsai',
  clientDisplayName: '247 ai',
  accounts: [{
    accountId: 'tfsai', accountDisplayName: 'Default', packageCode: 'custom',
    products: [{
      productId: 'discovery', roles: ['viewer'],
      components: [{ componentId: 'dialogmanager', componentClientId: '247ai', componentAccountId: '247ai' }]
    }]
  }],
  componentClientId: '247ai', apps: [{ appId: 'aisha', accountId: 'tfscorp', enableAiva: true, enableAnswers7: false },
    { appId: 'general', accountId: 'tfscorp', enableAiva: true, enableAnswers7: false },
    { appId: 'referencebot', accountId: 'tfscorp', enableAiva: true, enableAnswers7: false },
    { appId: 'retailbot', accountId: 'tfscorp', enableAiva: true, enableAnswers7: false }],
  role: 'viewer'
}];

const testClientConfigs = [{
  clientId: 'tfsai',
  clientDisplayName: '247 ai',
  accounts: [{
    accountId: 'tfsai', accountDisplayName: 'Default', packageCode: 'custom',
    products: [{
      productId: 'discovery', roles: ['developer'],
      components: [{ componentId: 'dialogmanager', componentClientId: '247ai', componentAccountId: '247ai' }]
    }]
  }],
  componentClientId: '247ai', apps: [{ appId: 'aisha', accountId: 'tfscorp', enableAiva: true, enableAnswers7: false },
    { appId: 'general', accountId: 'tfscorp', enableAiva: true, enableAnswers7: false },
    { appId: 'referencebot', accountId: 'tfscorp', enableAiva: true, enableAnswers7: false },
    { appId: 'retailbot', accountId: 'tfscorp', enableAiva: true, enableAnswers7: false }],
  role: 'developer'
}];

module.exports = { testCAAId, testProjects, testProject, updateProject, updateResponse,
  testCAA, testRun, testCreateRunReturnObj, testPatchParametersForProject, testPatchParametersForProjects, 
  emptyPatchParameters, postParametersForProject, 
  testRuns, testPatchParametersForProjectStatus, testRunCreateInput,
  testRunCreateInputInvalid, testPatchParametersForRun, getTestRunWithStatusAndResultUrl, validProjectStatus,
  invalidProjectStatus, validRunStatus_READY, validRunStatus_COMPLETE, invalidRunStatus, runCount, projCount,
  projDataSetURL, runResultURL, updateRunStatusAndResultURLparams, systemTestProject, systemTestProjects,
  testClientConfigsRes, testClientConfigs };
