/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const objectUtils = require('../lib/utils/object-utils');
const constants = require('../lib/constants');
const uniqueId = require('../lib/utils/unique-id');
const celeryTask = require('../lib/celery-tasks');
const errorHandler = require('../lib/error-handler');
const validateLimit = require('../lib/validate-limit');

module.exports.createRun = async (req, res) => {
  const { swagger: { params }, app: { locals: { db, _config, celery } }, logger, body: data } = req;
  const {
    accountId: { value: account },
    clientId: { value: client },
    applicationId: { value: app },
    projectId: { value: projectId },
  } = params;
  const userId = req.userContext.userinfo.email;
  const { QUEUED: runStatus } = constants.RUN_STATUS_CODES;
  const currentTime = Date.now();
  const modified = currentTime;
  const modifiedBy = userId;
  const created = currentTime;
  const createdBy = userId;
  const starred = 0;
  const { QUEUED_STATUS_DESCRIPTION: runStatusDescription } = constants.RUN_STATUS_CODES;

  logger.debug('createRun.begin');

  // Check run limit.
  if (!await validateLimit.checkRunLimit(projectId, db, logger)) {
    logger.error(constants.ERRORS.MAX_RUN_NUM_EXCEEDED);
    res.status(400).json({ err: constants.ERRORS.MAX_RUN_NUM_EXCEEDED });
    return;
  }

  try {
    if (objectUtils.isUndefinedOrNull(data)) {
      throw new Error(constants.ERRORS.BODY_PARAMETERS_MISSING);
    }
    if (objectUtils.isEmptyOrNull(data.runName)) {
      throw new Error(constants.ERRORS.INVALID_POST_DATA_RUN_NAME_NOT_PROVIDED);
    }
    if (objectUtils.isEmptyOrNull(data.numOfClusters)) {
      throw new Error(constants.ERRORS.INVALID_POST_DATA_NUM_OF_CLUSTERS_NOT_PROVIDED);
    }
    if (objectUtils.isEmptyOrNull(data.numOfTurns)) {
      throw new Error(constants.ERRORS.INVALID_POST_DATA_NUM_OF_TURNS_NOT_PROVIDED);
    }

    const { runName, numOfClusters, numOfTurns } = data;
    const runDescription = objectUtils.isEmptyOrNull(data.runDescription) ? '' : data.runDescription;
    const runId = `run-${uniqueId.uuid()}`;
    const stopWordsList = objectUtils.isEmptyOrNull(data.stopWords) ? '' : data.stopWords;
    const stopWords = JSON.parse(stopWordsList);
    
    // Check if the projectId is valid
    let projectValid = await db.checkIfProjectValid(client, account, app, projectId);
    if (!projectValid) {
      throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    }
    const runParameters = {
      runId, client, account, app, projectId, runName, runDescription, numOfClusters, numOfTurns,
      stopWords, created, createdBy, modified, modifiedBy, runStatus, runStatusDescription, starred
    };
    await createNewRun(db, runParameters, celery, _config, logger);

    let response = runParameters;

    await db.updateProjectModifiedDetails(projectId, modified, modifiedBy);
    res.status(200).json(response);
  }
  catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app, projectId }, logger);
    logger.error(`createRun: Failed to create run for ${client}-${account}-${app} with projectId: ${projectId}, reason: ${err.message}`);
    errorHandler.sendErrorResponse('createRun', err, res, client, errorState);
  }
};

const createNewRun = async (db, runParameters, celery, _config, logger) => {
  logger.debug('[RUN] createNewRun: begin');
  const { runId, client, account, app, projectId, numOfClusters, numOfTurns, stopWords } = runParameters;
  // const retry = 0;

  try {
    //Get the dataset URL from projects
    const datasetURL = await db.getDatasetURL(client, account, app, projectId);

    if (datasetURL) {
      await db.createRun(runParameters);

      const runObject = {
        app: app,
        account: account,
        client: client,
        projectId: projectId,
        runId: runId,
        datasetURL: datasetURL,
        stopWords: stopWords,
        numOfClusters: numOfClusters,
        numOfTurns: numOfTurns
      };
      // if (systemProject) {
      //   Object.assign(runObject, { retry });
      // }
      const taskParametersArr = [runObject];
      await celeryTask.createAddTask(celery, taskParametersArr, logger)
        .then(async () => {
          logger.info('[RUN] createNewRun: celery task submitted, making run metadata entry in DB');
        })
        .catch(async (err) => {
          logger.error(`[RUN] createNewRun: failed to submit celery task! | Reason: ${err}`);
          await db.deleteRun(client, account, app, projectId, runId);
          throw new Error(constants.ERRORS.FAIL_TO_CREATE_RUN_TASK);
        });
    } else {
      logger.error('[RUN] createNewRun: failed to submit celery task! | Reason: original transcript is missing');
      throw new Error(constants.ERRORS.FAIL_TO_CREATE_RUN_TASK_TRANS_MISSING);
    }
  } catch (err) {
    logger.error(`[RUN] createNewRun: Failed to create run for ${client}-${account}-${app} with projectId: ${projectId}, reason: ${err.message}`);
    throw err;
  } finally {
    logger.debug('[RUN] createNewRun: end');
  }
};

module.exports.getAllRuns = async (req, res) => {
  const { swagger: { params }, app: { locals: { db } }, logger } = req;
  const {
    accountId: { value: account },
    clientId: { value: client },
    applicationId: { value: app },
    projectId: { value: projectId },
  } = params;

  logger.debug('getAllRuns.begin');

  try {
    // Check if the projectId is valid
    const projectValid = await db.checkIfProjectValid(client, account, app, projectId);
    if (!projectValid) {
      throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    }
    const response = await db.getAllRunsForAProject(projectId);
    res.status(200).json(response);
  }
  catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(`getAllRuns: Failed to get all runs for client ${client}, projectId ${projectId} reason: ${err.message}`);
    errorHandler.sendErrorResponse('getAllRuns', err, res, client, errorState);
  }
};

module.exports.getRun = async (req, res) => {
  const { swagger: { params }, app: { locals: { db } }, logger } = req;
  const {
    accountId: { value: account },
    clientId: { value: client },
    applicationId: { value: app },
    projectId: { value: projectId },
    runId: { value: runId },
  } = params;

  logger.debug('getRun.begin');

  try {
    // Check if the projectId is valid
    const projectValid = await db.checkIfProjectValid(client, account, app, projectId);
    if (!projectValid) {
      throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    }
    const response = await db.getRun(projectId, runId);
    // TODO: decide if an empty response should give an error
    // if (objectUtils.isEmptyOrNull(response)) {
    //   throw new Error(constants.ERRORS.NO_RUNS_FOUND);
    // }
    //eslint-disable-next-line no-unused-vars
    const { resultURL, ...responseWithoutResultURL } = response[0];
    res.status(200).json(responseWithoutResultURL);
  }
  catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(`getRun: Failed to get run for client ${client}, projectId ${projectId} reason: ${err.message}`);
    errorHandler.sendErrorResponse('getRun', err, res, client, errorState);
  }
};

/**
 * API to Update run name and description of the run
 * TODO: Add the validation to not allow DISABLED project to update
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.updateRun = async (req, res) => {
  const { swagger: { params }, app: { locals: { db } }, logger, body: data } = req;
  const {
    accountId: { value: account },
    clientId: { value: client },
    applicationId: { value: app },
    projectId: { value: projectId },
    runId: { value: runId },
  } = params;
  logger.debug('updateRun.begin');
  const userId = req.userContext.userinfo.email;
  const modified = Date.now();
  const modifiedBy = userId;
  const patchParametersToBeUpdated = validatingBodyParameters(data);

  try {
    // Check the if the path parameters are valid
    if (objectUtils.isEmptyOrNull(patchParametersToBeUpdated)) {
      logger.debug('Nothing to update. No parameters Specified');
      throw new Error(constants.ERRORS.BODY_PARAMETERS_MISSING)
    } else {
      patchParametersToBeUpdated.modified = modified;
      if (userId !== undefined) {
        patchParametersToBeUpdated.modifiedBy = userId
      } else {
        logger.info('Unable to fetch the user id');
      }
    }

    // Check if the projectId is valid
    const projectValid = await db.checkIfProjectValid(client, account, app, projectId);
    if (!projectValid) {
      throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    }
    const updateResponse = await db.updateRun(client, account, app, projectId, runId, patchParametersToBeUpdated);
    if (updateResponse) {
      logger.debug('Successfully updated');
      // Update the project modified details
      await db.updateProjectModifiedDetails(projectId, modified, modifiedBy);
      // Get the run object
      const response = await db.getRun(projectId, runId);
      if (objectUtils.isEmptyOrNull(response)) {
        throw new Error(constants.ERRORS.RUN_NOT_FOUND);
      }
      //eslint-disable-next-line no-unused-vars
      const { resultURL, ...responseWithoutResultURL } = response;
      res.send(responseWithoutResultURL);
    } else {
      logger.debug('Nothing to update');
      res.status(304).json({ runId: runId });
    }
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(`updateRun: Failed to update the run for client ${client}, projectId ${projectId} reason: ${err.message}`);
    errorHandler.sendErrorResponse('updateRun', err, res, client, errorState);
  }
};

/**
* API to delete run
* This deletes the run from the database
*
* @param req
* @param res
* @returns {Promise<void>}
*/
module.exports.deleteRun = async (req, res) => {
  const { swagger: { params }, app: { locals: { db, gcpdb, es } }, logger } = req;
  const {
    accountId: { value: account },
    clientId: { value: client },
    applicationId: { value: app },
    projectId: { value: projectId },
    runId: { value: runId },
  } = params;
  logger.debug('deleteRun.begin');
  const userId = req.userContext.userinfo.email;
  const modifiedBy = userId;
  const modified = Date.now();
  try {
    // Check if the projectId is valid
    const projectValid = await db.checkIfProjectValid(client, account, app, projectId);
    if (!projectValid) {
      throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    }
    deleteStatusUpdate(db, client, account, app, projectId, runId, modified, modifiedBy, logger, gcpdb, es);
    res.status(200).send({ runId });
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(`deleteRun: Failed to delete the run for client ${client}, projectId ${projectId} reason: ${err.message}`);
    errorHandler.sendErrorResponse('deleteRun', err, res, client, errorState);
  }
};

const deleteStatusUpdate = async (db, client, account, app, projectId, runId, modified, modifiedBy, logger, gcpdb, es) => {
  let deleteResponse, runResponse;
  try {
    runResponse = await db.getRun(projectId, runId);
    if (objectUtils.isEmptyOrNull(runResponse)) {
      throw new Error(constants.ERRORS.RUN_NOT_FOUND);
    } else {
      const patchParameters = deleteRunParameters(runResponse.runName, modified, modifiedBy);
      deleteResponse = await db.updateRun(client, account, app, projectId, runId, patchParameters);
    }
  } catch (err) {
    logger.error(
      `deleteStatusUpdate: Failed to update the status for the run for client ${client}, projectId ${projectId},`
      + ` runId ${runId} reason: ${err.message}`
    );
    throw err;
  }
  if (deleteResponse && runResponse.resultURL) {
    gcpdb.deleteDataset(runResponse.resultURL);
    logger.debug('Successfully deleted the run');
    // Update the project modified details
    try {
      const clustersArray = await es.getAllClusterData(client, account, app, projectId, runId);
      const clusterIdList = clustersArray.map(element => element.clusterId);
      const deleteResCluster = await es.deleteAnalysisDataByCluster(clusterIdList, runId);
      if (deleteResCluster) {
        await es.deleteAnalysisDataByRun(runId);
      }
      await db.updateProjectModifiedDetails(projectId, modified, modifiedBy);
    } catch (err) {
      logger.error(
        `deleteStatusUpdate: Failed to update the status for the run for client ${client}, projectId ${projectId},`
        + ` runId ${runId} reason: ${err.message}`
      );
      throw err;
    }
  }
};
function deleteRunParameters(runName, modified, modifiedBy) {
  const newRunName = `${runName}_DELETE_${modified}`;
  const params = Object.assign(
    constants.DELETE_STATUS_UPDATE,
    { runName: newRunName },
    { modified },
    { modifiedBy });
  return params;
}


//TODO: Blacklisting invalid parameters
function validatingBodyParameters(data) {
  const { runName, runDescription, starred, runStatus, runStatusDescription } = data;
  const patchParameters = {};
  if (!objectUtils.isEmptyOrNull(runName)) {
    patchParameters.runName = runName;
  }
  if (!objectUtils.isEmptyOrNull(runDescription)) {
    patchParameters.runDescription = runDescription;
  }
  if (!objectUtils.isEmptyOrNull(starred)) {
    patchParameters.starred = starred;
  }
  if (!objectUtils.isEmptyOrNull(runStatus)) {
    patchParameters.runStatus = runStatus;
  }
  if (!objectUtils.isEmptyOrNull(runStatusDescription)) {
    patchParameters.runStatusDescription = runStatusDescription;
  }
  return patchParameters;
}

// Not in Swagger. In server.js (requires no authentication) Will be invoked by celery worker
module.exports.updateRunStatusAndResultURL = async (req, res) => {
  const { params, logger, app: { locals: { db, celery } }, body: data } = req;
  const { accountId: account, clientId: client, applicationId: app, projectId: projectId, runId: runId } = params;
  logger.debug('updateRunStatusAndResultURL.begin');
  const patchParametersToBeUpdated = validatingRunStatusParameters(data);
  let retry = parseInt(req.headers.retry) || undefined;
  if (objectUtils.isEmptyOrNull(patchParametersToBeUpdated)) {
    logger.debug('updateRunStatusAndResultURL: Nothing to update. No parameters Specified');
    res.status(400).json({ err: constants.ERRORS.BODY_PARAMETERS_MISSING });
    return;
  }
  try {
    // Check if the project is valid
    const projectResponse = await db.getProject(client, account, app, projectId);
    if (objectUtils.isEmptyOrNull(projectResponse)) {
      throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    }
    // if (projectResponse.projectStatus === constants.PROJECT_STATUS_CODES.DISABLED) {
    //   throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    // }

    let updateResponse;
    const { runStatus } = data;

    if (runStatus && runStatus === 'FAILED' && retry && retry < constants.RETRY_THRESHOLD) {
      const runResponse = await db.getRun(projectId, runId);
      retry = retry + 1;
      let runObject = {
        app: app,
        account: account,
        client: client,
        projectId: projectId,
        runId: runId,
        datasetURL: projectResponse.datasetURL,
        stopWords: runResponse.stopWords,
        numOfClusters: runResponse.numOfClusters,
        numOfTurns: runResponse.numOfTurns,
        retry: retry,
      };
      const taskParametersArr = [runObject];
      await celeryTask.createAddTask(celery, taskParametersArr, logger)
        .then(async () => {
          logger.info('[RUN] createNewRun: celery task submitted, making run metadata entry in DB');
        })
        .catch(async (err) => {
          logger.error(`[RUN] createNewRun: failed to submit celery task! | Reason: ${err}`);
          // await db.deleteRun(client, account, app, projectId, runId);
          throw new Error(constants.ERRORS.FAIL_TO_CREATE_RUN_TASK);
        });
    } else {
      updateResponse = await db.updateRun(client, account, app, projectId, runId, patchParametersToBeUpdated);
    }
    if (updateResponse) {
      logger.debug('updateRunStatusAndResultURL: Successfully updated');
      res.sendStatus(204);
    } else {
      logger.debug('Nothing to update');
      res.status(304).json({ runId: runId });
    }
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(
      `updateRunStatusAndResultURL: Failed to update the run status and result URL for client ${client},`
      + ` projectId ${projectId} reason: ${err.message}`
    );
    errorHandler.sendErrorResponse('updateRunStatusAndResultURL', err, res, client, errorState);
  }
};

//TODO: Blacklisting invalid parameters
function validatingRunStatusParameters(data) {
  const { runStatus, runStatusDescription, resultURL, numOfClusters } = data;
  const patchParameters = {};
  if (!objectUtils.isEmptyOrNull(runStatus)) {
    patchParameters.runStatus = runStatus;
  }
  if (!objectUtils.isEmptyOrNull(runStatusDescription)) {
    patchParameters.runStatusDescription = runStatusDescription;
  }
  if (!objectUtils.isEmptyOrNull(resultURL)) {
    patchParameters.resultURL = resultURL;
  }
  if (!objectUtils.isEmptyOrNull(numOfClusters)) {
    patchParameters.numOfClusters = numOfClusters;
  }
  return patchParameters;
}

module.exports.createNewRun = createNewRun;
module.exports.deleteStatusUpdate = deleteStatusUpdate;
