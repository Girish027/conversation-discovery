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
const FileUtils = require('../lib/utils/file-utils');
const DateUtils = require('../lib/utils/date-utils');
const runs = require('../controllers/runs');

module.exports.createSystemProject = async (req, res) => {
  const { params, app: { locals: { db, gcpdb, _config, celery, es } }, logger, body: data } = req;
  const { accountId: account, clientId: client, applicationId: app } = params;
  //TODO: Destructure this after authorization is added
  const userId = constants.SCHEDULER_NAME;
  const projectStatus = constants.PROJECT_STATUS_CODES.NEW;
  const modified = Date.now();
  const modifiedBy = userId;
  const created = modified;
  const createdBy = userId;
  const projectStatusDescription = '';
  logger.debug('createApp.begin');

  const maskedFileUploadPath = _config.get(constants.UPLOAD_BASE_PATH);

  if (objectUtils.isUndefinedOrNull(data)) {
    logger.error('createProject: Invalid post data');
    res.status(400).json({ err: constants.ERRORS.BODY_PARAMETERS_MISSING });
    return;
  }

  const projectName = constants.LIVE_DATA_ANALYSIS;

  const projectType = constants.PROJECT_TYPES.SYSTEM;
  const projectId = data.proj_UUID;
  const transcriptURL = data.transcriptURL;
  const startDate = DateUtils.toShortFormat(new Date(data.start));
  const endDate = DateUtils.toShortFormat(new Date(data.end));

  const datasetName = `${projectId}.csv`;
  const projectDescription = constants.SYSTEM_PROJ_DESCRIPTION({ startDate, endDate });

  let datasetURL, maskedDatasetFilePath;

  try {
    let projectResponse = await db.getProjectByName(client, account, app, projectName);
    if (projectResponse) {
      let runList = await db.getAllRunsForAProject(projectResponse.projectId);
      if (runList) {
        runList.forEach(runElement => {
          runs.deleteStatusUpdate(
            db, client, account, app, projectResponse.projectId, runElement.runId, modified, userId, logger, gcpdb, es
          );
        });
      }
      await db.deleteProject(client, account, app, projectResponse.projectId, modified, userId, projectName);
    }
  } catch (err) {
    if (err.message === constants.ERRORS.CAA_DOES_NOT_EXISTS) {
      logger.info('proceeding to masking dataset');
    }
    else {
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app, projectId }, logger);
      logger.error(`createProject: Failed to create project for client ${client} ${err}`);
      errorHandler.sendErrorResponse('createProject', err, res, client, errorState);
    }
  }
  try {
    const maskedDatasetFile = await validateDataset.maskPIIData(transcriptURL, maskedFileUploadPath);
    maskedDatasetFilePath = maskedDatasetFile.path;

    if (fs.existsSync(maskedDatasetFilePath)) {
      //Get the caaId
      let caaId = await db.getCAAid(client, account, app);
      if (caaId === null) {
        // Create a new caaId
        caaId = await db.createNewCAAid(client, account, app);
      }
      const data = await gcpdb.uploadDataset(caaId, projectId, maskedDatasetFilePath, datasetName);
      datasetURL = data;

      //Push project details to Database
      await db.createProject(projectId, client, account, app, projectName, projectType, datasetName, projectDescription,
        userId, projectStatus, created, datasetURL, caaId);
      let response = {
        projectId, app, account, client, projectName, datasetName, projectDescription, modified,
        modifiedBy, created, createdBy, projectStatus, projectStatusDescription, projectType
      };

      const runId = `run-${uniqueId.uuid()}`;
      const systemProject = true;
      const { QUEUED: runStatus, QUEUED_STATUS_DESCRIPTION: runStatusDescription } = constants.RUN_STATUS_CODES;
      const {
        DEFAULT_RUN_NAME: runName,
        DEFAULT_RUN_DESCRIPTION: runDescription,
        DEFAULT_NUM_OF_CLUSTERS: numOfClusters,
        DEFAULT_NUM_OF_TURNS: numOfTurns,
        DEFAULT_STOP_WORDS: stopWords,
        DEFAULT_STARRED_VALUE: starred,
      } = constants.RUN_DEFAULTS;

      const runParameters = {
        runId, client, account, app, projectId, runName, runDescription, numOfClusters, numOfTurns, stopWords, created,
        createdBy, modified, modifiedBy, runStatus, runStatusDescription, starred, systemProject
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
  }
  logger.debug('createApp.end');
};
