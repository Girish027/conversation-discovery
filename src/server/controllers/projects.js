/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const fs = require('fs');
const objectUtils = require('../lib/utils/object-utils');
const constants = require('../lib/constants');
const uniqueId = require('../lib/utils/unique-id');
const ObjectUtils = require('../lib/utils/object-utils');
const errorHandler = require('../lib/error-handler');
const validateDataset = require('../lib/validate-dataset');
const validateLimit = require('../lib/validate-limit');
const FileUtils = require('../lib/utils/file-utils');
const runs = require('../controllers/runs');

module.exports.createProject = async (req, res) => {
  const { swagger: { params }, app: { locals: { db, gcpdb, _config, celery } }, logger, body: data } = req;
  const { accountId: { value: account }, clientId: { value: client }, applicationId: { value: app } } = params;
  //TODO: Destructure this after authorization is added
  const userId = req.userContext.userinfo.email;
  const projectStatus = _config.get(constants.PROJECT_STATUS_CODES.QUEUED);
  const modified = Date.now();
  const modifiedBy = userId;
  const created = modified;
  const createdBy = userId;
  const projectStatusDescription = '';
  logger.debug('createApp.begin');

  const maskedFileUploadPath = _config.get(constants.UPLOAD_BASE_PATH);

  // Check project limit.
  if (!await validateLimit.checkProjectLimit(client, account, app, db, logger)) {
    logger.error(constants.ERRORS.MAX_PROJ_NUM_EXCEEDED);
    res.status(400).json({ err: constants.ERRORS.MAX_PROJ_NUM_EXCEEDED });
    return;
  }

  if (objectUtils.isUndefinedOrNull(data)) {
    logger.error('createProject: Invalid post data');
    res.status(400).json({ err: constants.ERRORS.BODY_PARAMETERS_MISSING });
    return;
  }

  const { projectName } = data;
  const { datasetName } = data;

  if (objectUtils.isEmptyOrNull(projectName)) {
    logger.error('createProject: Project Name is missing');
    res.status(400).json({ err: constants.ERRORS.INVALID_POST_DATA_APP_NAME_NOT_PROVIDED });
    return;
  }

  if (objectUtils.isEmptyOrNull(datasetName)) {
    logger.error('createProject: Dataset Name is missing');
    res.status(400).json({ err: constants.ERRORS.INVALID_POST_DATA_APP_NAME_NOT_PROVIDED });
    return;
  }

  if (req.files === undefined || req.files === null || req.files[0].size === 0) {
    res.status(400).json({ err: constants.ERRORS.INVALID_POST_DATA_FILE_NOT_PROVIDED });
    return;
  }

  const projectDescription = objectUtils.isEmptyOrNull(data.projectDescription) ? '' : data.projectDescription;
  const projectId = `pro-${uniqueId.uuid()}`;
  const datasetFilePath = req.files[0].path;
  const csvFile = req.files[0].originalname;

  let datasetURL;

  let maskedDatasetFilePath;

  try {
    validateProjectName(projectName);
    await validateDataset.isDatasetValid(datasetFilePath, csvFile);
    var maskedDatasetFile = await validateDataset.maskPIIData(datasetFilePath, maskedFileUploadPath);
    maskedDatasetFilePath = maskedDatasetFile.path;

    if (fs.existsSync(maskedDatasetFilePath)) {
      //Get the caaId
      let caaId = await db.getCAAid(client, account, app);
      if (caaId === null) {
        // Create a new caaId
        caaId = await db.createNewCAAid(client, account, app);
      }
      //Push dataset file to gcp
      const data = await gcpdb.uploadDataset(caaId, projectId, maskedDatasetFilePath, datasetName);

      // datasetURL = data[0].name; /* GCP IMPLEMENTATION */
      datasetURL = data;

      // set projectType as Manual
      let projectType = constants.PROJECT_TYPES.MANUAL;

      //Push project details to DB
      await db.createProject(projectId, client, account, app, projectName, projectType, datasetName, projectDescription,
        userId, projectStatus, created, datasetURL, caaId);
      let response = {
        projectId, app, account, client, projectName, datasetName, projectDescription, modified,
        modifiedBy, created, createdBy, projectStatus, projectStatusDescription
      };

      //TODO: Invoke Validation Task
      // Create a celery task for default run
      const runId = `run-${uniqueId.uuid()}`;
      const { QUEUED: runStatus, QUEUED_STATUS_DESCRIPTION: runStatusDescription } = constants.RUN_STATUS_CODES;
      const { DEFAULT_RUN_NAME: runName, DEFAULT_RUN_DESCRIPTION: runDescription, DEFAULT_NUM_OF_CLUSTERS: numOfClusters,
        DEFAULT_NUM_OF_TURNS: numOfTurns, DEFAULT_STOP_WORDS: stopWords, DEFAULT_STARRED_VALUE: starred } = constants.RUN_DEFAULTS;

      const runParameters = {
        runId, client, account, app, projectId, runName, runDescription, numOfClusters,
        numOfTurns, stopWords, created, createdBy, modified, modifiedBy, runStatus, runStatusDescription, starred
      };

      await runs.createNewRun(db, runParameters, celery, _config, logger);
      res.status(200).json(response);
    } else {
      throw new Error('Unable to save the project');
    }

  } catch (err) {
    if (!ObjectUtils.isEmptyOrNull(datasetURL)) {
      gcpdb.deleteDataset(datasetURL);
    }
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app, projectId }, logger);
    logger.error(`createProject: Failed to create project for client ${client} ${err}`);
    errorHandler.sendErrorResponse('createProject', err, res, client, errorState);
  } finally {
    //Remove the dataset file from local path once it is stored in GCP
    await FileUtils.removeDatasetFile(maskedDatasetFilePath, logger);
    await FileUtils.removeDatasetFile(datasetFilePath, logger);
  }
  logger.debug('createApp.end');
};


/**
 * API to fetch all the projects
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.getProjects = async (req, res) => {
  const { swagger: { params }, app: { locals: { db } }, logger } = req;
  logger.info('getProjects.begin');
  const { accountId: { value: account }, clientId: { value: client }, applicationId: { value: app } } = params;
  const projectStatusEnabled = params.projectStatusEnabled === null || params.projectStatusEnabled === undefined ? true : params.projectStatusEnabled.value;
  let response;
  try {
    response = await db.getProjects(client, account, app, projectStatusEnabled);
    res.status(200).send(response);
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(`getProject: Failed to get all projects for client ${client}, reason: ${err.message}`);
    errorHandler.sendErrorResponse('getProject', err, res, client, errorState);
  }
};

/**
 * API to Update project name and description of the project
 * TODO: Add the validation to not allow DISABLED project to update
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.updateProject = async (req, res) => {
  const { swagger: { params }, app: { locals: { db } }, logger, body: data } = req;
  const { accountId: { value: account }, clientId: { value: client }, applicationId: { value: app }, projectId: { value: projectId } } = params;
  logger.debug('updateProject.begin');
  const userId = req.userContext.userinfo.email;
  const modified = Date.now();
  const systemAccess = req.headers.systemaccess;
  const patchParametersToBeUpdated = validatingBodyParameters(data);
  let updateResponse;
  try {
    const projectResponse = await db.getProject(client, account, app, projectId);
    if (objectUtils.isEmptyOrNull(projectResponse)) {
      throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    }
    if (ObjectUtils.isEmptyOrNull(patchParametersToBeUpdated)) {
      logger.debug('Nothing to update. No parameters Specified');
      res.status(400).json({ err: constants.ERRORS.BODY_PARAMETERS_MISSING });
      return;
    }
    else if (((patchParametersToBeUpdated.projectName === constants.LIVE_DATA_ANALYSIS) && (systemAccess !== 'true')) ||
      ((patchParametersToBeUpdated.projectName === constants.LIVE_DATA_IN_REVIEW) && (systemAccess !== 'true')) ||
      ((projectResponse.projectType === constants.PROJECT_TYPES.SYSTEM) && (systemAccess !== 'true'))) {
      throw new Error(constants.ERRORS.UPDATE_PERMISSION_DENIED);
    }
    else {
      patchParametersToBeUpdated.modified = modified;
      if (userId !== undefined) {
        patchParametersToBeUpdated.modifiedBy = userId
      } else {
        logger.info('Unable to fetch the user id');
      }
    }
    updateResponse = await db.updateProject(client, account, app, projectId, patchParametersToBeUpdated, modified, userId);
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(`updateProject: Failed to update project for client ${client}, reason: ${err.message}`);
    errorHandler.sendErrorResponse('updateProject', err, res, client, errorState);
  }
  if (updateResponse) {
    logger.debug('Successfully updated');
  } else {
    logger.debug('Nothing to update');
  }
  if (updateResponse !== undefined) {
    let response;
    try {
      response = await db.getProject(client, account, app, projectId);
      if (objectUtils.isEmptyOrNull(response)) {
        throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
      }
      res.send(response);
    } catch (err) {
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
      logger.error(`getProject: Failed to get updated project for client ${client}, reason: ${err.message}`);
      errorHandler.sendErrorResponse('updateProject', err, res, client, errorState);
    }
  }
};

//TODO: Blacklisting invalid parameters
function validatingBodyParameters(data) {
  const projectName = data.projectName;
  const projectDescription = data.projectDescription;
  const projectStatus = data.projectStatus;
  const patchParameters = {};
  if (!ObjectUtils.isEmptyOrNull(projectName)) {
    patchParameters.projectName = projectName;
  }
  if (!ObjectUtils.isEmptyOrNull(projectDescription)) {
    patchParameters.projectDescription = projectDescription;
  }
  if (!ObjectUtils.isEmptyOrNull(projectStatus)) {
    patchParameters.projectStatus = projectStatus;
  }
  return patchParameters;
}


/**
 * API to delete project
 * This changes the project status to DISABLED.
 * TODO: Add the validation to not allow DISABLED project to update
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.deleteProject = async (req, res) => {
  const { swagger: { params }, app: { locals: { db, gcpdb, es } }, logger } = req;
  const { accountId: { value: account }, clientId: { value: client }, applicationId: { value: app }, projectId: { value: projectId } } = params;
  logger.debug('delete.begin');
  const userId = req.userContext.userinfo.email;
  const modified = Date.now();
  let deleteResponse, projectResponse, runList;
  try {
    projectResponse = await db.getProject(client, account, app, projectId);
    if (objectUtils.isEmptyOrNull(projectResponse)) {
      throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    } else {
      runList = await db.getAllRunsForAProject(projectId);
      // delete project and dataset.
      if (runList) {
        runList.forEach(runElement => {
          runs.deleteStatusUpdate(db, client, account, app, projectId, runElement.runId, modified, userId, logger, gcpdb, es);
        });
      }
      const updateParameters = patchParameters(projectResponse.projectName, modified, userId);
      deleteResponse = await db.updateProject(client, account, app, projectId, updateParameters, userId);
      if (deleteResponse && projectResponse.datasetURL) {
        logger.info('deleting project and dataset');
        // Remove dataset uploaded for deleted project.
        gcpdb.deleteDataset(projectResponse.datasetURL);
        res.status(200).send(projectResponse);
        logger.debug('Successfully updated');
      } else if (deleteResponse !== undefined) {
        res.send(projectResponse);
      } else {
        logger.debug('Nothing to update');
      }
    }
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(`deleteProject: Failed to get updated project for client ${client}, reason: ${err.message}`);
    errorHandler.sendErrorResponse('deleteProject', err, res, client, errorState);
  }
}

function patchParameters(projectName, modified, modifiedBy) {
  const newProjectName = `${projectName}_DELETE_${modified}`;
  const projectStatus = constants.PROJECT_STATUS_CODES.DISABLED;
  const params = Object.assign(
    { projectStatus },
    { projectName: newProjectName },
    { modified },
    { modifiedBy });
  return params;
}

function validateProjectName(projectName) {
  if ((projectName === constants.LIVE_DATA_ANALYSIS) || (projectName === constants.LIVE_DATA_IN_REVIEW)) {
    throw new Error(constants.ERRORS.CREATE_PERMISSION_DENIED);
  }
}

module.exports.patchParameters = patchParameters;
module.exports.validateProjectName = validateProjectName;
