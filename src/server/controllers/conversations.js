/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const constants = require('../lib/constants');
const errorHandler = require('../lib/error-handler');
const { validateRequest } = require('../controllers/clusters');

module.exports.getClusterConversations = async (req, res) => {
    const {query: {similarity}, query: {search}, query: {tId}} = req;
    const {swagger: {params}, app: {locals: {db}}, app: {locals: {es}}, logger} = req;
    const {accountId: {value: account}, clientId: {value: client}, applicationId: {value: app}, projectId: {value: projectId}, runId: {value: runId}, clusterId: {value: clusterId}} = params;

    logger.debug('getClusterConversations.begin');
    //console.log('ERROR: ', db);
    try {
        await validateRequest(db, client, account,app, projectId, runId, logger);

        const response = (tId != undefined) ? await es.getAllConversations(clusterId, tId) : await es.getClusterConversations(client, account, app, projectId, runId, clusterId, search, similarity);
        if (!response) {
            res.status(400).json({});
        }
        else {
            res.status(200).json(response);
        }
    }
    catch (err) {
        const errorState = errorHandler.handleErrorMsg(err, {client, account, app, projectId, runId, clusterId, search, similarity}, logger);
        logger.error(`getClusterConversations: Failed to get all clusters for client ${client}, projectId ${projectId} reason: ${err.message}`);
        errorHandler.sendErrorResponse('getClusterConversations', err, res, client, errorState);
    }
};

module.exports.assignIntentToConversation = async (req) => {

    const { swagger: { params }, app: { locals: { db } }, app: { locals: { es } }, logger } = req;
    const { accountId: { value: givenAccountId }, clientId: { value: givenClientId }, applicationId: { value: givenAppId }, projectId: { value: givenProjectId }, runId: { value: givenRunId }, clusterId: { value: givenClusterId } } = params;
    const conversationsToUpdate = req.swagger.params.body.originalValue.utterances;

    logger.debug('assignIntentToConversation.begin');

    await validateRequest(db, givenClientId, givenAccountId, givenAppId, givenProjectId, givenRunId, logger);

    var date = new Date();
    var time = date.getTime();
    var docSource = 'ctx._source.assigned_intent= params.assigned_intent; ctx._source.modified_by= params.modified_by; ctx._source.modified_at= params.modified_at;';
    var docParams = {
        assigned_intent: req.swagger.params.body.originalValue.nodeName,
        modified_by: (req.userContext && req.userContext.userinfo && req.userContext.userinfo.name) ? req.userContext.userinfo.name : 'UNKNOWN',
        modified_at: time
    };
    let updateResponse;
    try {
        for (let index = 0; index < conversationsToUpdate.length; index++) {
            let conversationId = conversationsToUpdate[index].utteranceId;
            if (conversationId) {
                logger.info('starting to update cluster details with intraction id ' + conversationId);
                updateResponse = await es.updateConversationData(givenClientId, givenAccountId, givenAppId, givenProjectId, givenRunId, givenClusterId,
                    conversationId, docSource, docParams);
                logger.info('finished updating cluster details with intraction id ' + conversationId);
            }
        }
        return updateResponse;
    }
    catch (err) {
        logger.error(`update cluster info for assigned-intent failed for client ${givenClientId}, projectId ${givenProjectId}, runId ${givenRunId}, appid ${givenAppId}, accountId ${givenAccountId}, payload ${docParams}, reason: ${err.message}`);
        throw new Error(constants.ERRORS.FAIL_TO_UPDATE_ASSIGNED_INTENT);
    }
};