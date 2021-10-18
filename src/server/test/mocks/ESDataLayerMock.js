/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const { allClusterDataES, allConversationES, interactionConversationES } = require('./../es-test-configs');
const constant = require('../../lib/constants');


class ESDataLayerMock {
  constructor(connector, logger, config) {
    this._connector = connector;
    this._logger = logger;
    this._config = config;
  }

  async postData() {
    // Mock - Post data into the index
  }

  async getAllClusterData(client, account, app, projectId, runId) {
    if (runId === 'run-11') {
      return undefined;
    }
    if ((runId === 'testrun') || (runId === 'testrun10')) {
      return [];
    }
    if (runId === 'run-12') {
      throw new Error('FAILED_TO_FETCH_DATA');
    }
    this._logger.info(`getAllClusterData: Fetching cluster data for client ${client}, account ${account}, app ${app}, project ${projectId} and run ${runId}`);
    return allClusterDataES;
  }

  async deleteAnalysisDataByCluster() {
    this._logger.info('Removing elastic Data');
    return 'res';
  }

  async deleteAnalysisDataByRun() {
    this._logger.info('Removing elastic Data');
    return
  }

  async updateClusterData(client, account, app, projectId, runId, clusterId, source, params) {
    if (runId === 'run-01') {
      return undefined;
    }
    if (runId === 'run-12') {
      throw new Error('FAILED_TO_FETCH_DATA');
    }
    this._logger.info(`updateClusterData: Updating cluster data for client ${client}, account ${account}, app ${app}, project ${projectId}, run ${runId}, cluster ${clusterId}, source ${source} and params ${params}.`);
    return {status: 'success'};
  }

  async bulkIndexDocuments (dataset,indexName) {
    this._logger.info(`bulkIndexDocuments: ingesting dataset ${dataset} in index ${indexName}.`);
    return;
  }
  
  async getAllConversations(clusterId, tid) {
    this._logger.info(`getAllConversations: getting for ${clusterId} in index ${tid}.`);
    if (clusterId === 'testClusterMock') {
      return undefined;
    }   
    return interactionConversationES;
  }

  async updateConversationData(clientId) {
    this._logger.info('updating Conversations Data');
    if (clientId === 'testClientMock') {
      return 'valid';
    }
    if (clientId === 'testErrorClientMock') {
      throw new Error('FAILED_TO_UPDATE_ASSIGNED_FAQ');
    }   
    return 'interactionConversationES';
  }

  async getClusterConversations(client, account, app, projectId, runId, clusterId, search, similarity) {
    this._logger.info(`getClusterConversations: getting for ${client},${account},${app},${projectId},${runId},${search}.`);
    if (similarity === 'Test1') {
      throw new Error(constant.ERRORS.NOT_A_NUMBER);
    }
    if (clusterId === 'testClusterMock') {
      return undefined;
    }
    return allConversationES;
  }
}

module.exports = ESDataLayerMock;
