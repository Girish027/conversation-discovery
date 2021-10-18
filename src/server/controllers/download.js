const constants = require('../lib/constants');
const errorHandler = require('../lib/error-handler');
const ObjectUtils = require('../lib/utils/object-utils');
const FileUtils = require('../lib/utils/file-utils');
const CONFIG_KEY = require('../lib/constants');

/**
 * Downloads the result of the run
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.downloadResult = async (req, res) => {
  const { swagger: { params }, app: { locals: { db, _config } }, logger } = req;
  const {
    accountId: { value: account },
    clientId: { value: client },
    applicationId: { value: app },
    projectId: { value: projectId },
    runId: { value: runId },
  } = params;
  logger.debug('download.begin');
  let projectResponse = await db.getProject(client, account, app, projectId);
  try {
    if (projectResponse.projectType) {
      checkProjectType(projectResponse.projectType);
    }
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app, projectId }, logger);
    errorHandler.sendErrorResponse('downloadResult', err, res, client, errorState);
    return;
  }
  //Find CAA id
  let caaId = await db.getCAAid(client, account, app);
  if (caaId === null) {
    logger.warn(`For client ${client} account ${account} app ${app} - ${constants.ERRORS.CAA_DOES_NOT_EXISTS}`);
    const err = new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app, projectId }, logger);
    errorHandler.sendErrorResponse('downloadResult', err, res, client, errorState);
    return;
  }
  //Find the runId exists in the database
  const run = await db.getRun(projectId, runId);
  if (ObjectUtils.isUndefinedOrNull(run)) {
    logger.warn(`For client ${client} account ${account} app ${app} - ${constants.ERRORS.RUN_NOT_FOUND}`);
    const err = new Error(constants.ERRORS.RUN_NOT_FOUND);
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app, projectId }, logger);
    errorHandler.sendErrorResponse('downloadResult', err, res, client, errorState);
    return;
  }
  //Check if the run is COMPLETED
  if (
    !(run.runStatus === constants.RUN_STATUS_CODES.COMPLETE || run.runStatus === constants.RUN_STATUS_CODES.READY)
    || ObjectUtils.isEmptyOrNull(run.resultURL === null)
  ) {
    logger.error(`Run:  ${run} not ready/completed. Download Failed`);
    const err = new Error(constants.ERRORS.RUN_PROCESS_NOT_COMPLETE);
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app, projectId }, logger);
    errorHandler.sendErrorResponse('downloadResult', err, res, client, errorState);
    return;
  }

  const resultUrl = FileUtils.getFetchAbsolutePath(run.resultURL, _config);

  res.setHeader('Content-disposition', 'attachment; filename=' + runId + '.zip');
  // console.log('run.resultUrl: ' + run.resultURL);
  res.download(resultUrl, function (err) {
    if (err) {
      logger.error(`downloadResult: Failed to download run result with runId ${runId} for client ${client}, reason: ${err.message}`);
    } else {
      logger.info('run results zip file download success. Clearing downloads.');
    }
  })

  function checkProjectType(projectType) {
    if (projectType === constants.PROJECT_TYPES.SYSTEM) {
      throw new Error(constants.ERRORS.DOWNLOAD_PERMISSION_DENIED);
    }
  }

  /* GCP RELATED CODE */
  // const downloadLocation = path.join(__dirname, '../RESULTS/',runId+'/');
  // const zipFilePath = path.join(downloadLocation, runId + '.zip');
  //   fs.ensureFileSync(zipFilePath);
  //   await gcpdb.downloadResults(run.resultURL, zipFilePath)
  //       .then((downloadLocation) => {
  //         res.setHeader('Content-disposition', 'attachment; filename=' + runId + '.zip');
  //         res.download(zipFilePath, function (err) {
  //         if (err) {
  //           logger.error(`downloadResult: Failed to download run result with runId ${runId} for client ${client}, reason: ${err.message}`);
  //         } else {
  //           logger.info('run results zip file download success. Clearing downloads.');
  //           fs.chmodSync(downloadLocation, '777');
  //           fs.emptyDirSync(downloadLocation);
  //           fs.rmdirSync(downloadLocation);
  //           }
  //         })
  //       })
  //       .catch((err) => {  
  //         const errorState = errorHandler.handleErrorMsg(err, {client, account, app}, logger);
  //         logger.error(`downloadResult: Exception... failed to download run result with runId ${runId} for client ${client}, reason: ${err.message}`);
  //         errorHandler.sendErrorResponse('downloadResult', err, res, client, errorState);
  //       })
};

/**
 * Downloads the dataset template for any client
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.downloadTemplate = async (req, res) => {
  const { app: { locals: { _config } }, logger } = req;
  const mountPath = _config.get(CONFIG_KEY.NFS_MOUNT_PATH);
  const template = `${mountPath}/dataset_upload_template.csv`;
  // dataset_upload_template
  res.setHeader('Content-disposition', 'attachment; filename=dataset_upload_template.csv');
  // console.log('template: ' + template);
  res.download(template, function (err) {
    if (err) {
      logger.error(`downloadResult: Failed to download run result, reason: ${err.message}`);
    } else {
      logger.info('run results zip file download success. Clearing downloads.');
    }
  })

  /* GCP RELATED CODE */
  // const {swagger: {params}, app: {locals: {awsdb, _config}}, logger} = req;
  // const {account: {value: account}, client: {value: client}, app: {value: app}} = params;
  // const downloadTemplateLocationUrl = _config.get(constants.DOWNLOAD_TEMPLATE_LOCATION_URL);
  // const bucketName = _config.get(constants.AWS_BUCKET_NAME);
  // const localDownloadBasePath = _config.get(constants.DOWNLOAD_BASE_PATH);
  // await awsdb.downloadFileUsingLocationUrl(downloadTemplateLocationUrl, localDownloadBasePath, bucketName)
  //     .then((filePath) => res.download(filePath))
  //     .catch((err) => {
  //       const errorState = errorHandler.handleErrorMsg(err, {client, account, app}, logger);
  //       logger.error(`downloadTemplate: Failed to get template for client ${client}, reason: ${err.message}`);
  //       errorHandler.sendErrorResponse('downloadTemplate', err, res, client, errorState);
  //     });
};