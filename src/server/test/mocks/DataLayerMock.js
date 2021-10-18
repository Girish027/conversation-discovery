/*eslint-disable*/
/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
const constants = require('../../lib/constants');
const { testProjects, testRuns, getTestRunWithStatusAndResultUrl} = require('../test-configs');

class DataLayerMock {
  constructor(connector, logger) {
    this._connector = connector;
    this._logger = logger;
  }

  async getCAAid(clientId) {
    const expectedClientId = 'invalidClient';
    if (expectedClientId === clientId) {
      return null;
    }
    const response = 'default';
    return response;
  }

  async createProject(projectId, clientId) {
    const expectedClientId = 'testclient';
    if (expectedClientId !== clientId) {
      throw new Error(constants.ERRORS.PROJECT_ALREADY_EXISTS);
    }
    const response = 'default';
    return response;
  }
  async getProjects(clientId, accountId, appId) {
    const expectedClientId = 'testclient';
    if (expectedClientId !== clientId) {
      return Promise.resolve([]);
    }
    if (appId === 'dummy' ) {
      throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
    }
    return testProjects;
  }

  async updateProject(clientId, accountId, appId, projectId) {
    const expectedProject = 'testproject';
    if (expectedProject === projectId) {
      throw new Error(constants.ERRORS.PROJECT_ALREADY_EXISTS);
    }

    const response = 'default';
    return response;
  }

  async getProject(clientId, accountId, appId, projectId) {
    const expectedProject = 'testproject1';
    if (expectedProject === projectId) {
      throw new Error(constants.ERRORS.PROJECT_ALREADY_EXISTS);
    }
    if (projectId === 'pro-one') {
      const projectName = 'testProj';
      const datasetURL = 'testURLS';
      const resp = { projectName, datasetURL };
      return resp;
    }
    if (projectId === 'pro-two') {
      const projectName = 'testProj';
      const resp = { projectName };
      return resp;
    }
    if (projectId === 'pro-three') {
      const projectName = 'testProj';
      const datasetURL = 'testURLS';
      const resp = { projectName, datasetURL, projectType: 'SYSTEM' };
      return resp;
    }
    if (projectId === 'pro-four') {
      const projectName = 'testProj';
      const datasetURL = 'testURLS';
      const resp = { projectName, datasetURL, projectType: 'MANUAL' };
      return resp;
    }
    if (projectId === 'testprojectcheck') {
      return undefined;
    }
    if (projectId === 'testprojectcheckdisabled') {
      const resp = { projectStatus: 'DISABLED' };
      return resp;
    }
    const response = 'default';
    return response;
  }

  async getProjectByName(clientId, accountId, appId, projectName) {
    const caaId = await this.getCAAid(clientId);
    if(caaId === null || caaId === undefined) {
      throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
    }
    const expectedProject = 'Conversations Analysis';
    let response;
    if (appId === 'testapps') {
      response = { projectName: expectedProject, projectId: 'tester'};
      return response;
    }
    if (appId === 'checkApp') {
      return undefined;
    }
    response = { projectName: expectedProject, projectId: 'sys_id'}
    return response;
  }

  async getDatasetURL(client) {
    if (client === 'ClientTestURL'){
      return undefined;
    }
    const response = 'default';
    return response;
  }

  async deleteProject(clientId) {
    const expectedClientId = 'testclient';
    if (expectedClientId !== clientId) {
      throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
    }

    const response = 'default';
    return response;
  }

  async createRun(runParameters) {
    ({ runId, clientId, account, app, projectId, runName, runDescription, numOfClusters, numOfTurns, stopWords, created, createdBy, modified, modifiedBy, runStatus, runStatusDescription, starred } = runParameters);
    const caaId = await this.getCAAid(clientId)
    const expectedRunName = 'testRunInvalid';
    if (caaId === null) {
      throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
    }
    if (expectedRunName === runName) {
      throw new Error(constants.ERRORS.RUN_ALREADY_EXISTS);
    }
    const response = 'default';
    return response;
  }

  async getAllRunsForAProject(projectId) {
    let arr = [];
    if(projectId === 'pro-one' || projectId === 'sys_id' || projectId === 'tester' || projectId === 'pro-two') {
      arr.push({runId: 'testrunincomplete'});
      return arr;
    }
    if (projectId === 'testPros') {
      return undefined;
    }
    const response = 'default';
    return response;
  }

  async updateProjectModifiedDetails(projectId) {
    if (projectId === 'invalidProjectId') {
      throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
    }
    const response = 'default';
    return response;
  }

  async checkIfProjectValid(client, account, app, projectId) {
    const expectedProject = 'testproject13';
    if (projectId === 'pro-123') {
      return false;
    }
    if (expectedProject === projectId) {
      return false;
    }
    return true;
  }

  async getRun(projectId, runId) {
    if (runId === 'testrun50') {
      return null;
    }
    if ( runId === 'testrun100') {
      return { resultURL: null };
    }
    if (runId === 'testrunincomplete') {
      return testRuns(constants.RUN_STATUS_CODES.QUEUE, 'http://intent-discovery.s3-aws-region.amazonaws.com/247ai-referencebot-referencebot/pro-1/run-1/');
    }
    if (runId === 'testrunwithresultnull') {
      return testRuns(constants.RUN_STATUS_CODES.COMPLETED, null);
    }
    const expectedRunId = 'testrun';
    if ((runId !== expectedRunId) && (runId !== 'testrun10') ) {
      return null;
    }
    return getTestRunWithStatusAndResultUrl(constants.RUN_STATUS_CODES.COMPLETE, 'src/server/test/mocks/dataset_upload_template.csv');
  }

  async checkIfRunValid(clientId, accountId, appId, projectId, runId) {
    const expectedRun = 'testRun13';
    if (runId === 'run-123') {
      return false;
    }
    if (expectedRun === runId) {
      return false;
    }
    return true;
  }

  async updateRun(clientId, accountId, appId, projectId, runId) {
    const updatedProject = 'testproject10';
    if (runId === 'testrun500') {
      return undefined;
    }
    if (updatedProject === projectId) {
      return undefined;
    }
    const response = 'default';
    return response;
  }

  async deleteRun(clientId, accountId, appId, projectId, runId) {
    const response = true;
    return response;
  }

  async getResultURL(client, account, app, projectId, runId) {
    if (runId === 'testrun10') {
      return 'src/server/test/mocks/idt_data_local_dc/test_result_data.zip'
    }
    if (runId === 'TestRunErr') {
      return undefined;
    }
    return 'src/server/test/mocks/test_result_data.zip';
  }

}

module.exports = DataLayerMock;
