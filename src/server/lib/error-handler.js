const constants = require('./constants');

function handleErrorMsg(err, obj, logger) {
  let status, message;
  let errObj = {};

  switch (err.message) {
    case constants.ERRORS.CAA_DOES_NOT_EXISTS:
      logger.error('The client, app, account does not exists');
      status = 404;
      errObj = {
        code: constants.ERRORS.CAA_DOES_NOT_EXISTS,
        message: `The client, app, account does not exists: client ${obj.client}, account ${obj.account} and app ${obj.app}`
      };
      break;
    case constants.ERRORS.DOWNLOAD_PERMISSION_DENIED:
      logger.error('download permission denied for system project');
      status = 403;
      errObj = {
        code: constants.ERRORS.DOWNLOAD_PERMISSION_DENIED,
        message: 'download permission denied for system project'
      };
      break;
    case constants.ERRORS.CREATE_PERMISSION_DENIED:
      logger.error('create permission denied for manual project');
      status = 403;
      errObj = {
        code: constants.ERRORS.CREATE_PERMISSION_DENIED,
        message: 'create permission denied for manual project'
      };
      break;
    case constants.ERRORS.UPDATE_PERMISSION_DENIED:
      logger.error('update permission denied');
      status = 403;
      errObj = {
        code: constants.ERRORS.UPDATE_PERMISSION_DENIED,
        message: 'update permission denied'
      };
      break;
    case constants.ERRORS.NODE_NAME_NOT_IN_NOUN_VERB_FORM:
      logger.error('The node name is not in NOUNE_ACTION form');
      status = 400;
      errObj = {
        code: constants.ERRORS.NODE_NAME_NOT_IN_NOUN_VERB_FORM,
        message: 'The node name is not in NOUN_ACTION form'
      };
      break;
    case constants.ERRORS.PROJECT_ALREADY_EXISTS:
      logger.error('The project already exists');
      status = 409;
      errObj = {
        code: constants.ERRORS.PROJECT_ALREADY_EXISTS,
        message: `Project name already exists for client ${obj.client}, account ${obj.account} and app ${obj.app}`
      };
      break;
    case constants.ERRORS.PROJECT_NOT_FOUND:
      logger.error('The project is not found');
      status = 404;
      errObj = {
        code: constants.ERRORS.PROJECT_NOT_FOUND,
        message: `Project is not found for client ${obj.client}, account ${obj.account} and app ${obj.app}`
      };
      break;
    case constants.ERRORS.RUN_NOT_FOUND:
      logger.error('The run is not found');
      status = 404;
      errObj = {
        code: constants.ERRORS.RUN_NOT_FOUND,
        message: `Run is not found for client ${obj.client}, account ${obj.account} and app ${obj.app}`
      };
      break;
    case constants.ERRORS.INVALID_POST_DATA_RUN_NAME_NOT_PROVIDED:
      logger.error('Run name is missing in the post data');
      status = 400;
      errObj = {
        code: constants.ERRORS.INVALID_POST_DATA_RUN_NAME_NOT_PROVIDED,
        message: `Run name is missing in the post data for ${obj.client}-${obj.account}-${obj.app}`
      };
      break;
    case constants.ERRORS.INVALID_POST_DATA_NUM_OF_CLUSTERS_NOT_PROVIDED:
      logger.error('Num of clusters parameter is missing in the post data');
      status = 400;
      errObj = {
        code: constants.ERRORS.INVALID_POST_DATA_NUM_OF_CLUSTERS_NOT_PROVIDED,
        message: `Num of clusters parameter is missing in the post data for ${obj.client}-${obj.account}-${obj.app}`
      };
      break;
    case constants.ERRORS.INVALID_POST_DATA_NUM_OF_TURNS_NOT_PROVIDED:
      logger.error('Num of turns parameter is missing in the post data');
      status = 400;
      errObj = {
        code: constants.ERRORS.INVALID_POST_DATA_NUM_OF_TURNS_NOT_PROVIDED,
        message: `Num of turns parameter is missing in the post data for ${obj.client}-${obj.account}-${obj.app}`
      };
      break;
    case constants.ERRORS.BODY_PARAMETERS_MISSING:
      logger.error('request body missing in the input data');
      status = 400;
      errObj = {
        code: constants.ERRORS.BODY_PARAMETERS_MISSING,
        message: `Body missing in the data for ${obj.client}-${obj.account}-${obj.app}`
      };
      break;
    case constants.ERRORS.RUN_PROCESS_NOT_COMPLETE:
      logger.error('The run not complete');
      status = 404;
      errObj = {
        code: constants.ERRORS.RUN_PROCESS_NOT_COMPLETE,
        message: `Run not complete for client ${obj.client}, account ${obj.account} and app ${obj.app} and project ${obj.projectId}`
      };
      break;
    case constants.ERRORS.DB_CONNECTION_ERROR:
      logger.error('DB Connection Error');
      status = 500;
      errObj = {
        code: constants.ERRORS.DB_CONNECTION_ERROR,
        message: 'DB connection error'
      };
      break;
    case constants.ERRORS.RUN_ALREADY_EXISTS:
      logger.error('The run name already exists');
      status = 409;
      errObj = {
        code: constants.ERRORS.RUN_ALREADY_EXISTS,
        message: `Run name already exists for ${obj.client}-${obj.account}-${obj.projectId}`
      };
      break;
    case constants.ERRORS.DATASET_FILE_IS_NOT_CSV:
      logger.error('Dataset File is not a csv');
      status = 400;
      errObj = {
        code: err.message,
        message: `Dataset File is not a csv for ${obj.client}-${obj.account}-${obj.projectId}`
      };
      break;
    case constants.ERRORS.DATASET_FILE_DOES_NOT_HAVE_FOUR_COLUMNS:
      logger.error('Dataset File does not have four columns');
      status = 400;
      errObj = {
        code: err.message,
        message: 'Dataset File does not have four columns'
      };
      break;
    case constants.ERRORS.NFS_UPLOAD_FILE_FAILED:
      logger.error('Fail to upload dataset file to NFS');
      status = 400;
      errObj = {
        code: err.message,
        message: `Fail to upload dataset file to NFS for ${obj.client}-${obj.account}-${obj.projectId}`
      };
      break;
    case constants.ERRORS.NFS_DOWNLOAD_FILE_FAILED:
      logger.error('Fail to download dataset file from NFS');
      status = 400;
      errObj = {
        code: err.message,
        message: `Fail to download dataset file from NFS for ${obj.client}-${obj.account}-${obj.projectId}`
      };
      break;
    case constants.ERRORS.NFS_DELETE_OBJECT_FAILED:
      logger.error('Fail to delete dataset file from NFS');
      status = 400;
      errObj = {
        code: err.message,
        message: `Fail to delete dataset file from NFS for ${obj.client}-${obj.account}-${obj.projectId}`
      };
      break;
    case constants.ERRORS.FAIL_TO_CREATE_RUN_TASK:
      logger.error('Fail to create run task');
      status = 400;
      errObj = {
        code: err.message,
        message: 'Connection to Discovery Model is broken! Fail to create run task for transcript.'
      };
      break;
    case constants.ERRORS.FAIL_TO_CREATE_RUN_TASK_TRANS_MISSING:
      logger.error('Fail to create run task due to missing transcript');
      status = 400;
      errObj = {
        code: err.message,
        message: `Redis Connection Error: Fail to create run task due to missing transcript for ${obj.client}-${obj.account}-${obj.projectId}`
      };
      break;
    case constants.ERRORS.RESPONSE_TITLE_OR_RESPONSE_CONTENT_NOT_PROVIDED:
      logger.error('Response Title and/or Response Content missing');
      status = 400;
      errObj = {
        code: err.message,
        message: 'Response Title and/or Response Content missing'
      };
      break;
    case constants.ERRORS.INVALID_OR_EMPTY_UTTERANCES:
      logger.error('Invalid or Empty Utterances');
      status = 400;
      errObj = {
        code: err.message,
        message: 'Invalid or Empty Utterances'
      };
      break;
    case constants.ERRORS.LANGUAGE_ID_NOT_PROVIDED:
      logger.error('Language Id missing');
      status = 400;
      errObj = {
        code: err.message,
        message: 'Language Id is missing'
      };
      break;
    case constants.ERRORS.RESPONSE_TITLE_OR_RESPONSE_ID_NOT_PROVIDED:
      logger.error('Response Title and/or Response Id missing');
      status = 400;
      errObj = {
        code: err.message,
        message: 'Response Title and/or Response Id is missing'
      };
      break;
    case constants.ERRORS.FAIL_TO_UPDATE_ASSIGNED_INTENT:
      logger.error('Incorrect input');
      status = 404;
      errObj = {
        code: err.message,
        message: `Failed to update cluster details in elastic search for ${obj.client}-${obj.account}-${obj.app}`
      };
      break;
    case constants.ERRORS.FAIL_TO_INGEST_DATA:
      logger.error('Fail to ingest result data to elastic-search');
      status = 400;
      errObj = {
        code: err.message,
        message: `Fail to ingest result data to elastic-search ${obj.client}-${obj.account}-${obj.projectId}`
      };
      break;
    case constants.ERRORS.NOT_A_NUMBER:
      logger.error('Incorrect input');
      status = 400;
      errObj = {
        code: err.message,
        message: `Incorrect input ${obj.client}-${obj.account}-${obj.app}-${obj.projectId}-${obj.runId}-${obj.clusterId}-${obj.search}-${obj.similarity}`
      };
      break;
    case constants.ERRORS.FAILURE_DUE_TO_NON_ASCII_CHARACTERS_IN_DATASET:
      logger.error('Non ascii data present in dataset');
      status = 400;
      errObj = {
        code: err.message,
        message: 'Non ascii data present in dataset'
      };
      break;
    default:
      status = 500;
      message = `Internal server error ${obj.client}, account ${obj.account} and app ${obj.app}. Please try again later`;

      if (!obj.client || !obj.account || obj.app) {
        message = 'Internal server error. Please try again later'
      }
      errObj = {
        code: constants.HTTP_ERROR.INTERNAL_SERVER_ERROR,
        message: message
      };
      break;
  }
  return {
    status,
    errObj
  };
}

function sendErrorResponse(TAG, err, res, client, errorState) {
  let defaultErrMsg = `Failed to ${TAG} for client : ${client} `;
  if (err && err.message) {
    defaultErrMsg = defaultErrMsg + err.message;
  }
  const defaultErrorCode = constants.HTTP_ERROR.INTERNAL_SERVER_ERROR;
  res.status(errorState.status).json({
    err: errorState.errObj.code === '' ? defaultErrorCode : errorState.errObj.code,
    message: errorState.errObj.message === '' ? defaultErrMsg : errorState.errObj.message
  });
}

module.exports = { handleErrorMsg: handleErrorMsg, sendErrorResponse: sendErrorResponse };
