/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const constants = require('../lib/constants');
const errorHandler = require('../lib/error-handler');
const axios = require('axios');
const conversations = require('../controllers/conversations');
const CONFIG_KEY = require('../lib/constants');
const AxiosUtils = require('../lib/utils/axios-utils');

/**
 * update given node
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function createIntent(req, res) {
  const { app: { locals: { _config } }, logger } = req;
  const {
    swagger: {
      params: {
        clientId: { value: givenClientId },
        projectId: { value: givenProjectId },
        runId: { value: givenRunId },
        applicationId: { value: givenAppId },
        accountId: { value: givenAccountId },
      }
    }
  } = req;
  let createIntentResponse;
  let createPayload;
  const payload = req.swagger.params.body.originalValue;
  const parentNodeId = req.swagger.params.body.originalValue.nodeId;
  const userid = req.userContext && req.userContext.userinfo && req.userContext.userinfo.sub;

  try {
    createPayload = await prepareCreatePayload(payload);
    createIntentResponse = await createNode(
      logger, givenClientId, givenAppId, _config, parentNodeId, createPayload, userid,
    );
    logger.info(`created node with payload : ${createPayload}`);
  }
  catch (err) {
    const errorState = errorHandler.handleErrorMsg(
      err, { client: givenClientId, account: givenAccountId, app: givenAppId }, logger,
    );
    logger.error(
      `create node in DM failed for client ${givenClientId}, projectId ${givenProjectId}, runId ${givenRunId},`
      + ` appid ${givenAppId}, accountId ${givenAccountId}, payload ${createPayload}, reason: ${err.message}`
    );
    errorHandler.sendErrorResponse('createIntentInDM', err, res, givenClientId, errorState);
  }

  if (createIntentResponse) {
    try {
      await conversations.assignIntentToConversation(req);
      res.status(201).json(createIntentResponse);
    } catch (err) {
      const errorState = errorHandler.handleErrorMsg(
        err, { client: givenClientId, account: givenAccountId, app: givenAppId }, logger,
      );
      logger.error(
        `assignedIntentinES: for ${givenClientId}, projectId ${givenProjectId}, runId ${givenRunId}, appid ${givenAppId},`
        + ` accountId ${givenAccountId}, payload ${payload}, reason: ${err.message}`);
      errorHandler.sendErrorResponse('assignedIntentInES', err, res, givenClientId, errorState);
    }
  }
}

/**
 * create node, or connect existing node, as child of given node in path
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function updateIntent(req, res) {
  const { app: { locals: { _config } }, logger } = req;
  const {
    swagger: {
      params: {
        clientId: { value: givenClientId },
        projectId: { value: givenProjectId },
        runId: { value: givenRunId },
        applicationId: { value: givenAppId },
        accountId: { value: givenAccountId },
      }
    }
  } = req;
  var updateIntentResponse;
  var updatePayload;
  const payload = req.swagger.params.body.originalValue;
  const nodeId = req.swagger.params.body.originalValue.nodeId;
  const userid = req.userContext && req.userContext.userinfo && req.userContext.userinfo.sub;

  try {
    updatePayload = await removeUtteranceId(payload);
    updateIntentResponse = await updateNode(logger, givenClientId, givenAppId, _config, nodeId, updatePayload, userid);
    logger.info(`updated node with payload : ${updatePayload}`);
  }
  catch (err) {
    const errorState = errorHandler.handleErrorMsg(
      err, { client: givenClientId, account: givenAccountId, app: givenAppId }, logger
    );
    logger.error(
      `update node in DM failed for client ${givenClientId}, projectId ${givenProjectId}, runId ${givenRunId},`
      + ` appid ${givenAppId}, accountId ${givenAccountId}, payload ${updatePayload}, reason: ${err.message}`
    );
    errorHandler.sendErrorResponse('updateIntentInDM', err, res, givenClientId, errorState);
  }

  if (updateIntentResponse) {
    try {
      await conversations.assignIntentToConversation(req);
      res.status(201).json(updateIntentResponse);
    } catch (err) {
      const errorState = errorHandler.handleErrorMsg(
        err, { client: givenClientId, account: givenAccountId, app: givenAppId }, logger
      );
      logger.error(
        `assignedIntentinES: for ${givenClientId}, projectId ${givenProjectId}, runId ${givenRunId},`
        + ` appid ${givenAppId}, accountId ${givenAccountId}, payload ${payload}, reason: ${err.message}`);
      errorHandler.sendErrorResponse('assignedIntentInES', err, res, givenClientId, errorState);
    }
  }
}

/**
 * get intents
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getIntents(req, res) {
  const { app: { locals: { _config } }, logger } = req;
  const {
    swagger: {
      params: {
        clientId: { value: givenClientId },
        projectId: { value: givenProjectId },
        runId: { value: givenRunId },
        applicationId: { value: givenAppId },
        accountId: { value: givenAccountId },
      }
    }
  } = req;
  var intentResponse;
  const userid = req.userContext && req.userContext.userinfo && req.userContext.userinfo.sub;

  try {
    intentResponse = await getUpdatableIntents(logger, givenClientId, givenAppId, _config, userid);
    res.status(200).json(intentResponse);
  }
  catch (err) {
    const errorState = errorHandler.handleErrorMsg(
      err, { client: givenClientId, account: givenAccountId, app: givenAppId }, logger
    );
    logger.error(
      `get intents from DM failed for client ${givenClientId}, projectId ${givenProjectId}, runId ${givenRunId},`
      + ` appid ${givenAppId}, accountId ${givenAccountId}, reason: ${err.message}`);
    errorHandler.sendErrorResponse('getIntentsFromDM', err, res, givenClientId, errorState);
  }
}

/**
 * A Method to make POST API call to create new node/intent
 * @param {*} logger
 * @param {*} clientId 
 * @param {*} appId 
 * @param {*} _config 
 * @param {*} parentNodeId 
 * @param {*} payload 
 */
async function createNode(logger, clientId, appId, _config, parentNodeId, payload, userid) {
  logger.info('#### createNode started! ####');

  const createNodeUrl = constants.API_URLS.CREATE_INTENTS({
    basePath: _config.get(CONFIG_KEY.DM_BASE_URL),
    clientId,
    appId,
    parentNodeId,
  });

  logger.info('#### createNode: DM API URL: ' + createNodeUrl);
  logger.info('#### createNode: Payload: ' + JSON.stringify(payload));

  AxiosUtils.addRetryInterceptor(axios);
  return axios({
    method: 'post',
    url: createNodeUrl,
    data: payload,
    headers: { userid },
  }).then(res => res.data).catch((err) => {
    throw new Error(err);
  });
}

/**
 * A Method to make PATCH call to update utterances for any node/intent.
 * @param {*} logger 
 * @param {*} clientId 
 * @param {*} appId 
 * @param {*} _config 
 * @param {*} nodeId 
 * @param {*} payload 
 */
async function updateNode(logger, clientId, appId, _config, nodeId, payload, userid) {
  logger.info('#### updateNode started!');

  const updateNodeUrl = constants.API_URLS.UPDATE_INTENTS({
    basePath: _config.get(CONFIG_KEY.DM_BASE_URL),
    clientId,
    appId,
    nodeId,
  });

  logger.info('#### updateNode: DM API URL: ' + updateNodeUrl);
  logger.info('#### updateNode: Payload: ' + JSON.stringify(payload));

  AxiosUtils.addRetryInterceptor(axios);
  return axios({
    method: 'patch',
    url: updateNodeUrl,
    data: payload,
    headers: { userid },
  }).then(res => res.data).catch((err) => {
    throw new Error(err);
  });
}

/**
 * A wrapper method to fetch all updatable intents/nodes from DM.
 * @param {*} logger 
 * @param {*} clientId 
 * @param {*} appId 
 * @param {*} _config 
 * @param {*} offset 
 * @param {*} limit 
 * @param {*} isModified 
 */
async function getUpdatableIntents(logger, clientId, appId, _config, userid, offset, limit, isModified) {
  const allAvailableNodes = await getAllAvailableNodes(logger, clientId, appId, _config, userid, offset, limit, isModified);
  const filteredNodes = await filterReadOnlyNodes(logger, allAvailableNodes);
  return filteredNodes;
}

/**
 * Fetches all available intents/nodes from DM. Intents are fetched with a limit of constants.INTENT_FETCH_LIMIT.
 * If the number of intents/nodes are more then the INTENT_FETCH_LIMIT then resetting limit to the total number of
 * intents/nodes and make GET call again.
 * @param {*} logger 
 * @param {*} clientId 
 * @param {*} appId 
 * @param {*} _config 
 * @param {*} offset 
 * @param {*} limit 
 * @param {*} isModified 
 */
async function getAllAvailableNodes(logger, clientId, appId, _config, userid, offset, limit, isModified) {
  let nodes = await getNodes(logger, clientId, appId, _config, userid, offset, limit, isModified);

  if ('paging' in nodes) {
    let totalNodes = nodes.paging.total;
    logger.info('total # of nodes/intents is - ' + totalNodes);
    if (totalNodes && totalNodes > constants.INTENT_FETCH_LIMIT) {
      logger.info('Fetching intents with new limit as - ' + totalNodes);
      nodes = await getNodes(logger, clientId, appId, _config, userid, offset, totalNodes, isModified);
    }
  }
  return nodes;
}

/**
 * Filter out nodes with 'utterance' value set to node.metadata['x-tfs-readonly]
 * It also filters out the nodes with invalid/undefined intent names.
 * @param {*} logger 
 * @param {*} nodes 
 */
async function filterReadOnlyNodes(logger, nodes) {
  if (nodes && ('data' in nodes)) {
    let filteredNodes = nodes.data.filter((node) => {
      // check for undefined intentName
      if (!('nodeName' in node) || (node.nodeName === '')) {
        return false;
      }
      // check for uiOrgCategory. only 'conversation' is allowed.
      if (('uiOrgCategory' in node) && (node.uiOrgCategory !== 'conversation')) {
        return false;
      }
      // check for readonly utterances property
      if (('metadata' in node) && ('x-tfs-readonly' in node.metadata)) {
        for (let index in node.metadata['x-tfs-readonly']) {
          if ('utterances' === node.metadata['x-tfs-readonly'][index]) {
            logger.debug(`readonly node: ${node.nodeName}, readonly prop: ${node.metadata['x-tfs-readonly']}`);
            return false;
          }
        }
      }
      logger.debug(`NO readonly node: ${node.nodeName}, readonly prop: ${node.metadata['x-tfs-readonly']}`);
      return true;
    });
    logger.info('List after filtering out nodes with readonly utterance property:');
    filteredNodes.forEach((node) => {
      logger.info('NodeName: ' + node.nodeName + '  readonly prop - ' + node.metadata['x-tfs-readonly']);
    });
    nodes.data = filteredNodes;
  }
  return nodes;
}

/**
 * A Method to make GET call to fetch intents/nodes from DM.
 * @param {*} logger 
 * @param {*} clientId 
 * @param {*} appId 
 * @param {*} _config 
 * @param {*} offset 
 * @param {*} limit 
 * @param {*} isModified 
 */
async function getNodes(logger, clientId, appId, _config, userid, offset, limit, isModified) {
  logger.info('#### getNodes started!');

  const getNodeUrl = constants.API_URLS.GET_INTENTS({
    basePath: _config.get(CONFIG_KEY.DM_BASE_URL),
    clientId,
    appId,
    offset: offset || 0,
    limit: limit || constants.INTENT_FETCH_LIMIT,
    isModified: isModified || false,
  });

  logger.info('#### getNodes: DM API URL: ' + getNodeUrl);

  AxiosUtils.addRetryInterceptor(axios);
  return axios({
    method: 'get',
    url: getNodeUrl,
    headers: { userid },
  }).then(res => res.data).catch((err) => {
    throw new Error(err);
  });
}

async function removeUtteranceId(payload) {
  var modifiedPayload = JSON.parse(JSON.stringify(payload));
  const uttenancesDetailsList = modifiedPayload.utterances;
  uttenancesDetailsList.forEach(function (uttenance) { delete uttenance.utteranceId });
  modifiedPayload.utterances = uttenancesDetailsList;
  return modifiedPayload;
}

/**
 * Helper method to prepare payload for create node POST call.
 *  - removes unwanted attribute - utteranceId,nodeId from payload.
 *  - Adds uiOrgProperty and set it to 'conversation'
 * @param {*} payload 
 */
async function prepareCreatePayload(payload) {
  let _payload = JSON.parse(JSON.stringify(payload));

  if (!_isNodeNameInNounVerbFormat(_payload.nodeName)) {
    const err = new Error(constants.ERRORS.NODE_NAME_NOT_IN_NOUN_VERB_FORM);
    throw err;
  }

  const uttenancesDetailsList = _payload.utterances;
  uttenancesDetailsList.forEach(function (uttenance) { delete uttenance.utteranceId });
  _payload.utterances = uttenancesDetailsList;

  delete _payload.nodeId;

  // _payload.uiOrgCategory = 'conversation'; // Not required as per AT-2603

  return _payload;
}

function _isNodeNameInNounVerbFormat(name) {
  const regex = /^[A-Z][A-Za-z0-9]*_[A-Z][A-Za-z0-9]*$/;
  return regex.test(name);
}

module.exports = {
  updateIntent,
  createIntent,
  getIntents,
  prepareCreatePayload,
  removeUtteranceId,
  filterReadOnlyNodes,
  getNodes,
  updateNode,
  createNode
};