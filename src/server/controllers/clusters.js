/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';
const constants = require('../lib/constants');
const errorHandler = require('../lib/error-handler');
const FileUtils = require('../lib/utils/file-utils');
const fs = require('fs-extra');
const fastcsv = require('fast-csv');
const uuid = require('uuid');
const md5 = require('md5');
var AdmZip = require('adm-zip');
var unzipper = require('unzipper');
const path = require('path');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

var validateRequest = async (db, client, account, app, projectId, runId, logger) => {
  try {
    // Check if the projectId is valid
    const projectValid = await db.checkIfProjectValid(client, account, app, projectId);
    if (!projectValid) {
      throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
    }
    //Check if the Run id is valid
    const runValid = await db.checkIfRunValid(client, account, app, projectId, runId);
    if (!runValid) {
      throw new Error(constants.ERRORS.RUN_NOT_FOUND);
    }
  }
  catch (err) {
    logger.error(`Request validation failed ${client}, projectId ${projectId} reason: ${err.message}`);
  }
}

module.exports.getAllClusters = async (req, res) => {
  const { swagger: { params }, app: { locals: { db } }, app: { locals: { es } }, logger } = req;
  const { accountId: { value: account }, clientId: { value: client }, applicationId: { value: app }, projectId: { value: projectId }, runId: { value: runId } } = params;

  logger.debug('getAllClusters.begin');
  try {

    await validateRequest(db, client, account, app, projectId, runId, logger);
    const response = await es.getAllClusterData(client, account, app, projectId, runId);
    if (!response) {
      res.status(500).json({});
    }
    else {
      res.status(200).json(response);
    }
  }
  catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(`getAllClusters: Failed to get all clusters for client ${client}, projectId ${projectId} reason: ${err.message}`);
    errorHandler.sendErrorResponse('getAllClusters', err, res, client, errorState);
  }
};

module.exports.updateCluster = async (req, res) => {
  const { swagger: { params }, app: { locals: { db } }, app: { locals: { es } }, logger } = req;
  const { accountId: { value: account }, clientId: { value: client }, applicationId: { value: app }, projectId: { value: projectId }, runId: { value: runId }, clusterId: { value: clusterId } } = params;
  const updateType = (req.body.type) ? req.body.type : 'UNKNOWN';

  logger.debug('updateCluster.begin');

  var docSource = '';
  var docParams = '';
  var date = new Date();
  var time = date.getTime();
  switch (updateType) {
    case 'clusterName':
      docSource = 'ctx._source.entire_cluster_label= params.new_label; ctx._source.description= params.description; ctx._source.modified_by= params.modified_by; ctx._source.modified_at= params.modified_at;';
      docParams = {
        new_label: req.body.clusterName,
        description: req.body.clusterDescription,
        modified_by: (req.userContext && req.userContext.userinfo && req.userContext.userinfo.name) ? req.userContext.userinfo.name : 'UNKNOWN',
        modified_at: time
      };
      break;

    case 'finalize':
      docSource = 'ctx._source.is_finalized= params.is_finalized; ctx._source.finalized_by= params.finalized_by;  ctx._source.finalized_by= params.finalized_by; ctx._source.modified_at= params.modified_at; ctx._source.finalized_at= params.finalized_at;';
      docParams = {
        is_finalized: true,
        finalized_by: (req.userContext && req.userContext.userinfo && req.userContext.userinfo.name) ? req.userContext.userinfo.name : 'UNKNOWN',
        finalized_at: time,
        modified_at: time
      };
      break;

    default:
      logger.error(`Unable to update cluster with update type ${updateType}`);
  }

  try {
    validateRequest(db, client, account, app, projectId, runId, logger);

    const response = await es.updateClusterData(client, account, app, projectId, runId, clusterId, docSource, docParams);
    if (!response) {
      res.status(500).json({});
    }
    else {
      res.status(204).send();
    }
  }
  catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
    logger.error(`updateCluster: Failed to update cluster for client ${client}, projectId ${projectId} reason: ${err.message}`);
    errorHandler.sendErrorResponse('updateCluster', err, res, client, errorState);
  }
};

module.exports.ingestClusterDataAndUpdateStatus = async (req, res) => {
  const { params, app: { locals: { db, es, _config } }, logger } = req;
  const { accountId: account, clientId: client, applicationId: app, projectId, runId } = params;

  logger.debug('ingestClusterDataAndUpdateStatus.begin');

  const downloadBasePath = _config.get(constants.DOWNLOAD_BASE_PATH);
  const downloadLocation = path.join(downloadBasePath, runId + '/');

  // fetch result URL from DB using projectid and runid
  try {
    const rUrl = await db.getResultURL(client, account, app, projectId, runId);
    if (rUrl) {
      const resultUrl = FileUtils.getFetchAbsolutePath(rUrl, _config);

      // Ingesting results to ES
      await ingestData(resultUrl, downloadLocation, es, logger, params, _config)
        .then(async () => {
          // Updating Status to READY
          const patchParametersToBeUpdated = {};
          patchParametersToBeUpdated.runStatus = 'READY';
          patchParametersToBeUpdated.runStatusDescription = 'Run is ready for review';

          try {
            const updateResponse = await db.updateRun(client, account, app, projectId, runId, patchParametersToBeUpdated);
            if (updateResponse) {
              logger.debug('ingestClusterDataAndUpdateStatus: Successfully updated');
            } else {
              logger.debug('Nothing to update');
            }
          } catch (err) {
            const errorState = errorHandler.handleErrorMsg(err, { client, account, app }, logger);
            logger.error(`ingestClusterDataAndUpdateStatus: Failed to update the run status for client ${client}, projectId ${projectId} reason: ${err.message}`);
            errorHandler.sendErrorResponse('ingestClusterDataAndUpdateStatus', err, res, client, errorState);
          }
        })
        .catch((err) => {
          const errorState = errorHandler.handleErrorMsg(err, { client, account, projectId }, logger);
          logger.error(`ingestClusterDataAndUpdateStatus: Failed to ingest data for client ${client}, projectId ${projectId} reason: ${err.message}`);
          errorHandler.sendErrorResponse('ingestClusterDataAndUpdateStatus', err, res, client, errorState);
        });

      res.status(204).json({});
    } else {
      throw new Error(constants.ERRORS.RUN_NOT_FOUND);
    }
  } catch (err) {
    const errorState = errorHandler.handleErrorMsg(err, { client, account, projectId }, logger);
    logger.error(`ingestClusterDataAndUpdateStatus: Failed to fetch results for client ${client}, projectId ${projectId} reason: ${err.message}`);
    errorHandler.sendErrorResponse('ingestClusterDataAndUpdateStatus', err, res, client, errorState);
  }
  logger.debug('ingestClusterDataAndUpdateStatus.end');
};

const ingestData = (cwd, unzippedFileLoc, es, logger, params, _config) => {
  const { clientId: client, applicationId: app, projectId, runId } = params;
  const transactionId = uuid.v4();

  return new Promise((resolve, reject) => {
    fs.createReadStream(cwd).pipe(unzipper.Extract({ path: unzippedFileLoc }))
    .promise()
    .then(async () => {
      try {
        logger.info(`ingestData: [UNZIP SUCCESS] - ${projectId}, ${runId}, ${client}, ${app}`);
        var zip = new AdmZip(cwd);
        var zipEntries = zip.getEntries();

        logger.info(`ingestData: [CLUSTERS & CONVERSATIONS INGESTION STARTED] - ${projectId}, ${runId}, ${client}, ${app}`);
        const ingestPromises = await processOutputFiles(zipEntries, unzippedFileLoc, es, logger, params, transactionId, _config);

        await Promise.all(ingestPromises).then((results) => {
          logger.info(`ingestData: [OUTPUT FILES] for ${projectId}, ${runId}, ${client}, ${app} - ${results}`);
        });
        logger.info(`ingestData: [CLUSTERS & CONVERSATIONS INGESTION COMPLETED] - ${projectId}, ${runId}, ${client}, ${app}`);

        logger.info(`ingestData: [END AND CLEAN] Data ingestion completed, Removing unzipped files from disk... - ${projectId}, ${runId}, ${client}, ${app}`);
        fs.chmodSync(unzippedFileLoc, '777');
        fs.emptyDirSync(unzippedFileLoc);
        fs.rmdirSync(unzippedFileLoc);

        logger.info(`ingestData: [INGEST SUCCESS] - ${projectId}, ${runId}, ${client}, ${app}`);
        resolve();
      } catch (e) {
        reject(e);
      }
    })
    .catch((unzipErr) => {
      reject(unzipErr);
    });
  });
};

const processOutputFiles = async (zipEntries, unzippedFileLoc, es, logger, params, transactionId, _config) => {
  return await zipEntries.map((entry) => {
    // Check for Cluster output files.
    if (entry.entryName.match(/output\//i) && !entry.entryName.match(/_all\//i) && entry.entryName.match(/csv/i)) {
      return ingestCluster(entry, unzippedFileLoc, es, logger, params, transactionId, _config);
    }
    // Check for Conversation output files.
    if (entry.entryName.match(/output\//i) && entry.entryName.match(/_all\//i) && entry.entryName.match(/csv/i)) {
      return ingestConversation(entry, unzippedFileLoc, es, logger, params, transactionId, _config);
    }
    // No need to process other files.
    return Promise.resolve('not_an_output_file');
  });
};

const ingestConversation = async (entry, unzippedFileLoc, es, logger, params, transactionId, _config) => {
  const { clientId: client, applicationId: app, projectId, runId } = params;

  return new Promise(async (resolve) => {
    logger.info(`processing conversation file - ${entry.entryName}`);
    const filePath = unzippedFileLoc + entry.entryName;
    const fileName = entry.entryName.split(/[/ ]+/).pop();
    if (fs.existsSync(filePath)) {
      const currentTime = Date.now();
      const cluster_id = md5(app + projectId + runId + fileName + transactionId);
      var extraParams = {
        cluster_id: cluster_id,
        created_by: constants.SERVICE_NAME,
        modified_by: constants.SERVICE_NAME,
        modified_at: currentTime,
        created_at: currentTime,
      };
      let stream = fs.createReadStream(filePath);
      let jsonObjArr = [];
      let headerInfo = constants.CONVERSATION_CSV_HEADER;
      let headers = [];
      let headerProcessed = false;
      let csvStream = fastcsv.parse()
        .on('data', async function (data) {
          if (!headerProcessed) {
            headers = headerInfo.toString().split(',');
            headerProcessed = true;
          } else {
            let obj = {};
            for (var i = 0; i < headers.length; i++) {
              if (headers[i] === 'sequence' || headers[i] === 'turn')
                obj[headers[i]] = parseInt(data[i]);
              else
                obj[headers[i]] = data[i];
            }
            if (extraParams) {
              Object.assign(obj, extraParams);
            }
            jsonObjArr.push(obj);
            if (jsonObjArr.length === constants.INGEST_BATCH_SIZE) {
              const jsonObjArrCopy = JSON.parse(JSON.stringify(jsonObjArr));
              jsonObjArr = [];
              try {
                logger.info(` --> ingesting conversation batch of size - ${jsonObjArrCopy.length}  from  ${fileName} of ${runId}`);
                await es.bulkIndexDocuments(jsonObjArrCopy, _config.get(constants.ES_CONVERSATION_INDEX));
              } catch (err) {
                logger.info(`ingestConversationData: Failed to ingest all rows for client ${client}, projectId ${projectId},run ${runId},file ${filePath} reason: ${err.message}`);
                resolve(`Conversation: ERR - ${err.message}`);
              }
              jsonObjArr = [];
            }
          }
        })
        .on('end', async function () {
          if (jsonObjArr.length > 0) {
            const jsonObjArrCopy = JSON.parse(JSON.stringify(jsonObjArr));
            jsonObjArr = [];
            try {
              logger.info(` --> ingesting last conversation batch of size - ${jsonObjArrCopy.length} from ${fileName} of ${runId}`);
              await es.bulkIndexDocuments(jsonObjArrCopy, _config.get(constants.ES_CONVERSATION_INDEX));
            } catch (err) {
              logger.info(`ingestConversationData: Failed to ingest all rows for client ${client}, projectId ${projectId},run ${runId},file ${filePath} reason: ${err.message}`);
              resolve(`Conversation: ERR - ${err.message}`);
            }
          }
          // remove the first line: header
          jsonObjArr.shift();
        });
      await pipeline(stream, csvStream);
      logger.info(`Processing conversation file completed - ${entry.entryName}!`);
      resolve(`Conversation: ${fileName}`);
    } else {
      logger.info(`FILE NOT FOUND conversation file  - ${filePath}`);
      resolve(`Conversation: ${fileName} FILE NOT FOUND`);
    }
  });
};

const ingestCluster = async (entry, unzippedFileLoc, es, logger, params, transactionId, _config) => {
  const { clientId: client, applicationId: app, projectId, runId } = params;

  return new Promise(async (resolve) => {
    logger.info(`processing cluster file - ${entry.entryName}`);
    const filePath = unzippedFileLoc + entry.entryName;
    const fileName = entry.entryName.split(/[/ ]+/).pop();
    if (fs.existsSync(filePath)) {
      const currentTime = Date.now();
      const cluster_id = md5(app + projectId + runId + fileName + transactionId);
      var extraParams = {
        app: app,
        project_id: projectId,
        run_id: runId,
        cluster_id: cluster_id,
        created_by: constants.SERVICE_NAME,
        modified_by: constants.SERVICE_NAME,
        modified_at: currentTime,
        created_at: currentTime,
        is_finalized: false,
        is_enabled: true,
      };
      let stream = fs.createReadStream(filePath);
      let jsonObjArr = [];
      let headerProcessed = false;
      let headers = [];
      let csvStream = fastcsv.parse()
        .on('data', async function (data) {
          if (!headerProcessed) {
            headers = data.toString().split(',');
            headerProcessed = true;
          } else {
            let obj = {}
            for (var i = 0; i < headers.length; i++) {
              obj[headers[i]] = data[i]
            }
            if (extraParams) {
              Object.assign(obj, extraParams);
            }
            jsonObjArr.push(obj);
            if (jsonObjArr.length === constants.INGEST_BATCH_SIZE) {
              const jsonObjArrCopy = JSON.parse(JSON.stringify(jsonObjArr));
              jsonObjArr = [];
              try {
                logger.info(` --> ingesting cluster batch of size - ${jsonObjArrCopy.length} from ${fileName} of ${runId}`);
                await es.bulkIndexDocuments(jsonObjArrCopy, _config.get(constants.ES_CLUSTER_INDEX));
              } catch (err) {
                logger.error(`ingestClusterData: Failed to ingest all rows for client ${client}, projectId ${projectId},run ${runId},file ${filePath} reason: ${err.message}`);
                resolve(`Cluster: ERR - ${err.message}`);
              }
            }
          }
        })
        .on('end', async function () {
          if (jsonObjArr.length > 0) {
            const jsonObjArrCopy = JSON.parse(JSON.stringify(jsonObjArr));
            jsonObjArr = [];
            try {
              logger.info(` --> ingesting last cluster batch of size - ${jsonObjArrCopy.length} from ${fileName} of ${runId}`);
              await es.bulkIndexDocuments(jsonObjArrCopy, _config.get(constants.ES_CLUSTER_INDEX));
            } catch (err) {
              logger.error(`ingestClusterData: Failed to ingest all rows for client ${client}, projectId ${projectId},run ${runId},file ${filePath} reason: ${err.message}`);
              resolve(`Cluster: ERR - ${err.message}`);
            }
          }
          // remove the first line: header
          jsonObjArr.shift();
        });
      await pipeline(stream, csvStream);
      logger.info(`Processing cluster file completed - ${entry.entryName}!`);
      resolve(`Cluster: ${fileName}`);
    } else {
      logger.info(`[ERR: FILE NOT FOUND] cluster file  - ${filePath}`);
      resolve(`Cluster: ${fileName} FILE NOT FOUND`);
    }
  });
};
module.exports.validateRequest = validateRequest;
