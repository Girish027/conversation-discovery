'use strict';

const constants = require('../lib/constants');
const errorHandler = require('../lib/error-handler');
const axios = require('axios');
const AxiosUtils = require('../lib/utils/axios-utils');
const objectUtils = require('../lib/utils/object-utils');

async function getFAQs(req, res) {
  const { swagger: { params }, logger, app: { locals: { _config } }} = req;
  const { clientId: { value: clientId }, interfaceId: { value: interfaceId } } = params;

  logger.info('#### getFAQs started!');
  try {

    const candidateFolderResult = await createCandidateFolder(clientId, interfaceId, '0', constants.CANDIDATE_FAQ, _config);
    if (!candidateFolderResult) {
      throw new Error(constants.ERRORS.CANDIDATE_FOLDER_NOT_CREATED);
    }
    const folderId = candidateFolderResult.folderID;
    const getFAQsUrl = constants.ANSWERS_API_URLS.GET_FAQS({
      clientId,
      interfaceId,
      folderId,
      basePath: _config.get(constants.ANSWERS_BASE_URL)
    });

    logger.info('#### getFAQs: ANSWERS API URL: ' + getFAQsUrl);
    const clientApiKey = getAnswersAPIKey(clientId, _config);
    AxiosUtils.addRetryInterceptor(axios);
    await axios({
      method: 'get',
      url: getFAQsUrl,
      headers: { 
        apiKey: clientApiKey.apiKey
      }
    }).then(result => {
      logger.info(`GetFAQs : ${result.data}`);
      if (result && result.data && result.data.children) {
        res.status(200).json(result.data.children);
      } else {
        res.status(200).json([]);
      }
        
    })
    .catch((err) => {
      throw new Error(err);
    });
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client: clientId }, logger);
    logger.error(`getFAQs: Failed to getFAQs for client ${clientId} , reason: ${err.message}`);
    errorHandler.sendErrorResponse('getFAQs', err, res, clientId, errorState);
  }
}

async function createFaqAnswers(clientId, interfaceId, folderId, languageId, data, config, logger) {
  let result;
  logger.info('#### createFaqAnswers started!');

    const createFAQUrl = constants.ANSWERS_API_URLS.POST_FAQ({
      clientId,
      interfaceId,
      folderId,
      languageId,
      basePath: config.get(constants.ANSWERS_BASE_URL),
    });

    logger.info('#### createFAQ: ANSWERS API URL: ' + createFAQUrl);
    const clientApiKey = getAnswersAPIKey(clientId, config);
    AxiosUtils.addRetryInterceptor(axios);
    result = await axios({
      method: 'post',
      url: createFAQUrl,
      data: data,
      headers: { 
        apiKey: clientApiKey.apiKey
      }
    }).then(result => result.data).catch((err) => {
      throw new Error(err);
    });
    return result;
}

async function getInterfaceList(req, res) {
   const { swagger: { params: { clientId: { value: clientId } } }, app: { locals: { _config } }, logger } = req;
 
   try {
    logger.info('Getting Interface List started');
    const getInterfaceListUrl = constants.ANSWERS_API_URLS.GET_INTERFACES_LIST({
     clientId,
     basePath: _config.get(constants.ANSWERS_BASE_URL),
    });
    const clientApiKey = getAnswersAPIKey(clientId, _config);
    AxiosUtils.addRetryInterceptor(axios);
    const list = await axios({
      method: 'get',
      url: getInterfaceListUrl,
      headers: { 
        apiKey: clientApiKey.apiKey
      }
    }).then(result => result.data).catch((err) => {
      throw new Error(err);
    });
    res.status(200).send(list);
   } catch (err) {
     const errorState = errorHandler.handleErrorMsg(err, { clientId }, logger);
     logger.error(`getInterfaceList: Failed to get interface List for client ${clientId} ${err}`);
     errorHandler.sendErrorResponse('getInterfaceList', err, res, clientId, errorState);
   }
 }

async function updateFaqAnswers (clientId, interfaceId, responseId, data, config, logger) {
  let result;
  logger.info('starting updateFaqAnswers');
     const updateUrl = constants.ANSWERS_API_URLS.UPDATE_QUESTIONS({
       clientId,
       interfaceId,
       responseId,
       basePath: config.get(constants.ANSWERS_BASE_URL),
     });
     const clientApiKey = getAnswersAPIKey(clientId, config);
     AxiosUtils.addRetryInterceptor(axios);
     result = await axios({
       method: 'post',
       url: updateUrl,
       data: data,
       headers: { 
        apiKey: clientApiKey.apiKey
      }
     }).then(result => result.data).catch((err) => {
       throw new Error(err);
     });
     return result;
 }

async function createCandidateFolder(clientId, interfaceId, parentFolderId, folderName, config) {
   const createFolderUrl = constants.ANSWERS_API_URLS.POST_CANDIDATE_FAQ_FOLDER({
    clientId,
    interfaceId,
    parentFolderId,
    basePath: config.get(constants.ANSWERS_BASE_URL)
   });
   const clientApiKey = getAnswersAPIKey(clientId, config);
   AxiosUtils.addRetryInterceptor(axios);
   const resultingFolderId = await axios({
     method: 'post',
     url: createFolderUrl,
     data: { folderName },
     headers: { 
      apiKey: clientApiKey.apiKey
    }
   }).then(result => result.data).catch((err) => {
     throw new Error(err);
   });
  return resultingFolderId;
}

async function createFAQ(req, res) {
  const { swagger: { params: { clientId: { value: clientId }, accountId: { value: accountId }, applicationId: { value: appId }, projectId: { value: projectId }, runId: { value: runId }, clusterId: { value: clusterId },interfaceId: { value: interfaceId } } }, logger, body: data, app: { locals: { _config, es } }, userContext } = req;
  try {
    logger.info('createFAQ started');
    if (objectUtils.isUndefinedOrNull(data)) {
      logger.error('createFAQ Input Body missing');
      throw new Error(constants.ERRORS.BODY_PARAMETERS_MISSING);
    }
    const languageId = data.languageId;
    const utterances = data.utterances;
    const responseTitle = data.responseTitle;
    const responseContent = data.responseContent;
    if (!utterances) {
      throw new Error(constants.ERRORS.INVALID_OR_EMPTY_UTTERANCES);
    }
    if (!(utterances.length)) {
      throw new Error(constants.ERRORS.INVALID_OR_EMPTY_UTTERANCES);
    }
    if (!responseTitle) {
      throw new Error(constants.ERRORS.RESPONSE_TITLE_OR_RESPONSE_CONTENT_NOT_PROVIDED);
    }
    if (!responseContent) {
      throw new Error(constants.ERRORS.RESPONSE_TITLE_OR_RESPONSE_CONTENT_NOT_PROVIDED);
    }
    if (!languageId) {
      throw new Error(constants.ERRORS.LANGUAGE_ID_NOT_PROVIDED);
    }
    const candidateFolderResult = await createCandidateFolder(clientId, interfaceId, '0', constants.CANDIDATE_FAQ, _config);
    if (!candidateFolderResult) {
      throw new Error(constants.ERRORS.CANDIDATE_FOLDER_NOT_CREATED);
    }
    const folderId = candidateFolderResult.folderID;
    const faqPayload = prepareCreateFaqPayload(data);
    const result = await createFaqAnswers(clientId, interfaceId, folderId, languageId, faqPayload, _config, logger);
    await assignFaq(clientId, accountId, appId, projectId, runId, clusterId, utterances, userContext, responseTitle, es, logger);
    res.status(200).send(result);
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client: clientId, account: accountId, app: appId }, logger);
    logger.error(`createFAQ: Failed to createFAQ for client ${clientId} ${err}`);
    errorHandler.sendErrorResponse('createFAQ', err, res, clientId, errorState);
  }
}

async function updateFAQ(req, res) {
  const { swagger: { params: { clientId: { value: clientId }, accountId: { value: accountId }, applicationId: { value: appId }, projectId: { value: projectId }, runId: { value: runId }, clusterId: { value: clusterId },interfaceId: { value: interfaceId } } }, logger, body: data, app: { locals: { _config, es } }, userContext } = req;
  try {
    logger.info('update FAQ started');
    if (objectUtils.isUndefinedOrNull(data)) {
      logger.error('updateFAQ Input Body missing');
      throw new Error(constants.ERRORS.BODY_PARAMETERS_MISSING);
    }
    const responseId = data.responseId;
    const responseTitle = data.responseTitle;
    const utterances = data.utterances;
    if (!data.utterances) {
      throw new Error(constants.ERRORS.INVALID_OR_EMPTY_UTTERANCES);
    }
    if (!(utterances.length)) {
      throw new Error(constants.ERRORS.INVALID_OR_EMPTY_UTTERANCES);
    }
    if (!responseTitle) {
      throw new Error(constants.ERRORS.RESPONSE_TITLE_OR_RESPONSE_ID_NOT_PROVIDED);
    }
    if (!(responseId)) {
      throw new Error(constants.ERRORS.RESPONSE_TITLE_OR_RESPONSE_ID_NOT_PROVIDED);
   }
    const faqPayload = prepareUpdateFaqPayload(data);
    const result = await updateFaqAnswers(clientId, interfaceId, responseId, faqPayload, _config, logger);
    await assignFaq(clientId, accountId, appId, projectId, runId, clusterId, utterances, userContext, responseTitle, es, logger);
    res.status(200).send(result);
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client: clientId, account: accountId, app: appId }, logger);
    logger.error(`updateFAQ: Failed to updateFAQ for client ${clientId} ${err}`);
    errorHandler.sendErrorResponse('updateFAQ', err, res, clientId, errorState);
  }
}

function prepareCreateFaqPayload(data) {
  const { responseTitle, responseContent, utterances } = data;
  const payload = {};
  let questionListMap = [];
  utterances.forEach((Utterance) => { 
    let object = { 
      question: Utterance.utterance,
      revisedQuestion: '' 
    }; 
    questionListMap.push(object); 
  })
  payload.questionListMap = questionListMap;
  payload.responseTitle = responseTitle;
  payload.responseContent = responseContent;
  return payload;
}

function prepareUpdateFaqPayload(data) {
  const { utterances } = data;
  const payload = {};
  let questionListMap = [];
  utterances.forEach((Utterance) => { 
    let object = { 
      question: Utterance.utterance,
      revisedQuestion: '' 
    };
    questionListMap.push(object); 
  })
  payload.questionListMap = questionListMap;
  return payload;
}

function getAnswersAPIKey(clientId, config) {
  let clientApiKey = config.get(constants.ANSWERS_API_KEY);
  clientApiKey = clientApiKey.find(element => element.clientId === clientId);
  if (clientApiKey === undefined) {
        throw new Error(constants.ERRORS.API_KEY_NOT_PROVIDED);
    }
  return clientApiKey;
  }

async function assignFaq(clientId, accountId, appId, projectId, runId, clusterId, UtterancesData, userContext, responseTitle, es, logger) {
  logger.debug('assignFaq.begin');
  var date = new Date();
  var time = date.getTime();
  var docSource = 'ctx._source.assigned_faq= params.assigned_faq; ctx._source.modified_by= params.modified_by; ctx._source.modified_at= params.modified_at;';
  var docParams = {
    assigned_faq: responseTitle,
    modified_by: (userContext && userContext.userinfo && userContext.userinfo.name) ? userContext.userinfo.name : 'UNKNOWN',
    modified_at: time
  };
  let updateResponse;
  try {
    for (let index = 0; index < UtterancesData.length; index++) {
      let interactionId = UtterancesData[index].utteranceId;
      if (interactionId) {
        logger.info('starting to update cluster details with intraction id ' + interactionId);
        updateResponse = await es.updateConversationData(clientId, accountId, appId, projectId, runId, clusterId,
          interactionId, docSource, docParams);
        logger.info('finished updating cluster details with intraction id ' + interactionId);
      }
    }
    return updateResponse;
  }
  catch (err) {
    logger.error(`update cluster info for assigned-faq failed for client ${clientId}, projectId ${projectId}, runId ${runId}, appid ${appId}, accountId ${accountId}, payload ${docParams}, reason: ${err.message}`);
    throw new Error('FAILED_TO_UPDATE_ASSIGNED_FAQ');
  }
}


module.exports = {
    getFAQs,
    createFAQ,
    updateFAQ,
    getInterfaceList,
    createCandidateFolder,
    assignFaq,
    updateFaqAnswers,
    createFaqAnswers,
    prepareCreateFaqPayload,
    prepareUpdateFaqPayload,
    getAnswersAPIKey
};