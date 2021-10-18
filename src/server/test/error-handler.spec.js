const errorHandler = require('../lib/error-handler');
const constants = require('../lib/constants');
import mockLog from '../lib/__mocks__/logger';
const client = 'client',
  account = 'account',
  app = 'app';

describe('error-handler', function () {
  beforeAll(() => {
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Error Object Test', function () {
    
    test('Should return error object for CAA_DOES_NOT_EXISTS', async () => {
      const err = new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(404);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.CAA_DOES_NOT_EXISTS);
    });

    test('Should return error object for NODE_NAME_NOT_IN_NOUN_VERB_FORM', async () => {
      const err = new Error(constants.ERRORS.NODE_NAME_NOT_IN_NOUN_VERB_FORM);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.NODE_NAME_NOT_IN_NOUN_VERB_FORM);
    });

    test('Should return error object for PROJECT_ALREADY_EXISTS', async () => {
      const err = new Error(constants.ERRORS.PROJECT_ALREADY_EXISTS);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(409);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.PROJECT_ALREADY_EXISTS);
    });

    test('Should return error object for PROJECT_NOT_FOUND', async () => {
      const err = new Error(constants.ERRORS.PROJECT_NOT_FOUND);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(404);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.PROJECT_NOT_FOUND);
    });

    test('Should return error object for RUN_NOT_FOUND', async () => {
      const err = new Error(constants.ERRORS.RUN_NOT_FOUND);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(404);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.RUN_NOT_FOUND);
    });

    test('Should return error object for INVALID_POST_DATA_RUN_NAME_NOT_PROVIDED', async () => {
      const err = new Error(constants.ERRORS.INVALID_POST_DATA_RUN_NAME_NOT_PROVIDED);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.INVALID_POST_DATA_RUN_NAME_NOT_PROVIDED);
    });

    test('Should return error object for INVALID_POST_DATA_NUM_OF_CLUSTERS_NOT_PROVIDED', async () => {
      const err = new Error(constants.ERRORS.INVALID_POST_DATA_NUM_OF_CLUSTERS_NOT_PROVIDED);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.INVALID_POST_DATA_NUM_OF_CLUSTERS_NOT_PROVIDED);
    });

    test('Should return error object for INVALID_POST_DATA_NUM_OF_TURNS_NOT_PROVIDED', async () => {
      const err = new Error(constants.ERRORS.INVALID_POST_DATA_NUM_OF_TURNS_NOT_PROVIDED);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.INVALID_POST_DATA_NUM_OF_TURNS_NOT_PROVIDED);
    });

    test('Should return error object for BODY_PARAMETERS_MISSING', async () => {
      const err = new Error(constants.ERRORS.BODY_PARAMETERS_MISSING);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.BODY_PARAMETERS_MISSING);
    });

    test('Should return error object for RUN_NOT_FOUND', async () => {
      const err = new Error(constants.ERRORS.RUN_NOT_FOUND);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(404);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.RUN_NOT_FOUND);
    });

    test('Should return error object for RUN_PROCESS_NOT_COMPLETE', async () => {
      const err = new Error(constants.ERRORS.RUN_PROCESS_NOT_COMPLETE);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(404);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.RUN_PROCESS_NOT_COMPLETE);
    });

    test('Should return error object for DB_CONNECTION_ERROR', async () => {
      const err = new Error(constants.ERRORS.DB_CONNECTION_ERROR);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(500);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.DB_CONNECTION_ERROR);
    });

    test('Should return error object for RUN_ALREADY_EXISTS', async () => {
      const err = new Error(constants.ERRORS.RUN_ALREADY_EXISTS);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(409);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.RUN_ALREADY_EXISTS);
    });

    test('Should return error object for BODY_PARAMETERS_MISSING', async () => {
      const err = new Error(constants.ERRORS.BODY_PARAMETERS_MISSING);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.BODY_PARAMETERS_MISSING);
    });

    test('Should return error object for DATASET_FILE_IS_NOT_CSV', async () => {
      const err = new Error(constants.ERRORS.DATASET_FILE_IS_NOT_CSV);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.DATASET_FILE_IS_NOT_CSV);
    });

    test('Should return error object for DATASET_FILE_DOES_NOT_HAVE_FOUR_COLUMNS', async () => {
      const err = new Error(constants.ERRORS.DATASET_FILE_DOES_NOT_HAVE_FOUR_COLUMNS);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.DATASET_FILE_DOES_NOT_HAVE_FOUR_COLUMNS);
    });
    
    test('Should return error object for NFS_UPLOAD_FILE_FAILED', async () => {
      const err = new Error(constants.ERRORS.NFS_UPLOAD_FILE_FAILED);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.NFS_UPLOAD_FILE_FAILED);
    });

    test('Should return error object for NFS_DOWNLOAD_FILE_FAILED', async () => {
      const err = new Error(constants.ERRORS.NFS_DOWNLOAD_FILE_FAILED);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.NFS_DOWNLOAD_FILE_FAILED);
    });

    test('Should return error object for NFS_DELETE_OBJECT_FAILED', async () => {
      const err = new Error(constants.ERRORS.NFS_DELETE_OBJECT_FAILED);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.NFS_DELETE_OBJECT_FAILED);
    });

    test('Should return error object for FAIL_TO_CREATE_RUN_TASK', async () => {
      const err = new Error(constants.ERRORS.FAIL_TO_CREATE_RUN_TASK);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.FAIL_TO_CREATE_RUN_TASK);
    });

    test('Should return error object for FAIL_TO_CREATE_RUN_TASK_TRANS_MISSING', async () => {
      const err = new Error(constants.ERRORS.FAIL_TO_CREATE_RUN_TASK_TRANS_MISSING);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.FAIL_TO_CREATE_RUN_TASK_TRANS_MISSING);
    });

    test('Should return error object for FAIL_TO_UPDATE_ASSIGNED_INTENT', async () => {
      const err = new Error(constants.ERRORS.FAIL_TO_UPDATE_ASSIGNED_INTENT);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(404);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.FAIL_TO_UPDATE_ASSIGNED_INTENT);
    });

    test('Should return error object for FAIL_TO_INGEST_DATA', async () => {
      const err = new Error(constants.ERRORS.FAIL_TO_INGEST_DATA);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.FAIL_TO_INGEST_DATA);
    });

    test('Should return error object for NOT_A_NUMBER', async () => {
      const err = new Error(constants.ERRORS.NOT_A_NUMBER);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.NOT_A_NUMBER);
    });

    test('Should return error object for FAILURE_DUE_TO_NON_ASCII_CHARACTERS_IN_DATASET', async () => {
      const err = new Error(constants.ERRORS.FAILURE_DUE_TO_NON_ASCII_CHARACTERS_IN_DATASET);
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(400);
      expect(errorState.errObj.code).toEqual(constants.ERRORS.FAILURE_DUE_TO_NON_ASCII_CHARACTERS_IN_DATASET);
    });

    test('Should return error object for default unknown server error', async () => {
      const err = new Error('DEFAULT_UNKNOWN_ERROR');
      const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, mockLog);
      expect(errorState.status).toEqual(500);
      expect(errorState.errObj.code).toEqual(constants.HTTP_ERROR.INTERNAL_SERVER_ERROR);
    });
  
  });
});