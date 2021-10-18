/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
 'use strict';

 const constants = require('./constants');
 const ObjectUtils = require('./utils/object-utils');
 const UpdateQueryBuilder = require('./update-query-builder');
 const operators = require('./operators');

 const TAG = 'DataLayer';

 class DataLayer {
   constructor(connector, logger, config) {
     this._connector = connector;
     this._logger = logger;
     this._config = config;
     this.initialize();
   }

   async initialize() {
     // Initialize the DataLayer
     try {
       this._logger.info('Initializing DataLayer');
     } catch (err) {
       throw err;
     }
   }

   /**
    * Get the CAAid of the provided client, account and app; Returns null if a CAAid doesn't exist
    * @param {string} clientId
    * @param {string} accountId
    * @param {string} appId
    */
   async getCAAid(clientId, accountId, appId) {
    this._logger.info(`${TAG}:getCAAid: get an existing CAAid ${clientId}, ${accountId}, ${appId}`);
    const query1 = `select caaID from CAA where client = '${clientId}' and account = '${accountId}' and app = '${appId}'`
    this._logger.debug(`${TAG}:getCAA: Executing query: ${query1}`);
    let response;
    try {
      response = await this._connector.executeQuery(query1);
    } catch (err) {
      this._logger.error(`${TAG}:getCAAid: Error executing query: ${err.sqlMessage}
        with state ${err.sqlState} and code ${err.code}`);
      throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
    }
     if (response.length === 0) {
       this._logger.error(`${TAG}:getCAAid: Unable to find the CAAid`);
       //TODO: Check for null in the functions where this method is called.
       return null;
     }
    // Todo: Utility function
    response = JSON.parse(JSON.stringify(response));

    // Todo: utility
    return response[0]['caaID'];
  }

  /**
   *
   * @param {string} clientId
   * @param {string} accountId
   * @param {string} appId
   */
  async createNewCAAid(clientId, accountId, appId) {
    this._logger.info(`${TAG}:createNewCAAid: Create a new CAA for ${clientId}, ${accountId}, ${appId}`);
    // Todo: Utility function
    const caaIdString = `${clientId}-${accountId}-${appId}`;
    const query1 = `insert into CAA (caaId, client, app, account) values ('${caaIdString}', '${clientId}', '${appId}', '${accountId}')`;
    this._logger.debug(`${TAG}:getCAA: Executing query: ${query1}`);
    try {
      await this._connector.executeQuery(query1);
      return caaIdString;
    } catch (err) {
      this._logger.error(`${TAG}:getCAA: Error executing query: ${err.sqlMessage}
        with state ${err.sqlState} and code ${err.code}`);
      if (err.code === constants.DB_ERROR_CODES.ER_DUP_ENTRY) {
        throw new Error(constants.ERRORS.CAA_ALREADY_EXISTS);
      } else {
        throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
        }
    }
   }

   /**
    *
    * @param projectId
    * @param {string} clientId
    * @param {string} accountId
    * @param {string} appId
    * @param {string} projectName
    * @param {string} datasetName
    * @param {string} projectDescription
    * @param {string} createdBy The AD id of the person who creates the project
    * @param projectStatus
    * @param created
    */
   async createProject(projectId, clientId, accountId, appId, projectName, projectType, datasetName, projectDescription, createdBy, projectStatus, created, datasetURL, caaId) {
     this._logger.info(`${TAG}:createProject: Creating a new Project ${clientId}, ${accountId}, ${appId}, ${projectName}, ${projectType}`);
     let description = ObjectUtils.isEmptyOrNull(projectDescription) ? '' : projectDescription;
     const query = `insert into project (projectId, caaId, projectName, datasetName, projectDescription, created, createdBy, projectStatus, modified, modifiedBy, datasetURL, projectType) values ('${projectId}', '${caaId}', '${projectName}', '${datasetName}', '${description}', '${created}', '${createdBy}', '${projectStatus}', '${created}', '${createdBy}', '${datasetURL}', '${projectType}')`;
      try {
       await this._connector.executeQuery(query);
     } catch (err) {
       this._logger.error(`${TAG}:createProject: Error executing query: ${err.sqlMessage}
         with state ${err.sqlState} and code ${err.code}`);
         if (err.code === constants.DB_ERROR_CODES.ER_DUP_ENTRY) {
          throw new Error(constants.ERRORS.CAA_ALREADY_EXISTS);
        } else {
          throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
          }
     }
   }

   /**
    * @param {object} runParameters All the required run parameters
    */
   async createRun (runParameters) {
     const { runId, client, account, app, projectId, runName, runDescription, numOfClusters, numOfTurns, stopWords, created, createdBy, modified, modifiedBy, runStatus, runStatusDescription, starred } = runParameters;
     this._logger.info(`${TAG}:createRun: Creating a new Project ${client}, ${account}, ${app}, ${runName}`);
     const caaId = await this.getCAAid(client, account, app);

     if (caaId === null) {
       throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
     }
    
     const query = `insert into run (runId, projectId, runName, runDescription, numOfClusters, numOfTurns, stopWords, created, createdBy, modified, modifiedBy,  runStatus, runStatusDescription, starred) values ('${runId}', '${projectId}', '${runName}', '${runDescription}', ${numOfClusters}, ${numOfTurns}, '${stopWords}', '${created}', '${createdBy}', '${modified}', '${modifiedBy}', '${runStatus}', '${runStatusDescription}', ${starred})`;
     try {
       await this._connector.executeQuery(query);
     } catch (err) {
       this._logger.error(`${TAG}:createRun: Error executing query: ${err.sqlMessage} with state ${err.sqlState} and code ${err.code}`);
       switch (err.code) {
       case constants.DB_ERROR_CODES.ER_DUP_ENTRY:
         throw new Error(constants.ERRORS.RUN_ALREADY_EXISTS);
       case constants.DB_ERROR_CODES.ER_NO_REFERENCED_ROW_2:
         throw new Error(constants.ERRORS.PROJECT_NOT_FOUND);
       default:
         throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
       }
     }
   }

   /**
    * Check if a project is valid: not disabled or deleted
    * @param {string} clientId
    * @param {string} accountId
    * @param {string} appId
    * @param {string} projectId
    */
   async checkIfProjectValid (clientId, accountId, appId, projectId) {
     this._logger.info(`${TAG}:checkIfProjectValid: Checking if the project is valid ${clientId}, ${accountId}, ${appId}, ${projectId}`);
     const caaId = await this.getCAAid(clientId, accountId, appId);

    if (caaId === null) {
      throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
    }
    const query = `select projectStatus from project where caaId='${caaId}' and projectId='${projectId}'`;
    try {
      const response = await this._connector.executeQuery(query);
      if (ObjectUtils.isEmptyOrNull(response)) {
        return false;
      }
      let result = response[0];
      if (result.projectStatus === constants.PROJECT_STATUS_CODES.DISABLED) {
        return false;
      }
      else {
        return true;
      }
    } catch (err) {
      this._logger.error(`${TAG}:checkIfProjectValid: Error executing query: ${err.sqlMessage} with state ${err.sqlState} and code ${err.code}`);
      //throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
    }
   }

   /**
    * Check if a run is valid: if exists and successfully completed
    * @param {string} clientId
    * @param {string} accountId
    * @param {string} appId
    * @param {string} projectId
    * @param {string} runId
    */
   async checkIfRunValid (clientId, accountId, appId, projectId, runId) {
    this._logger.info(`${TAG}:checkIfRunValid: Checking if the run is valid ${clientId}, ${accountId}, ${appId}, ${projectId}`);
    const caaId = await this.getCAAid(clientId, accountId, appId);

    if (caaId === null) {
      throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
    }
    const query = `select runStatus from run where projectID='${projectId}' and runID='${runId}'`;
    try {
      const response = await this._connector.executeQuery(query);
      if (ObjectUtils.isEmptyOrNull(response)) {
        return false;
      }
      let result = response[0];
      if (result.runStatus !== constants.RUN_STATUS_CODES.READY && result.runStatus !== constants.RUN_STATUS_CODES.COMPLETE) {
        return false;
      }
      else {
        return true;
      }
    } catch (err) {
      this._logger.error(`${TAG}:checkIfRunValid: Error executing query: ${err.sqlMessage} with state ${err.sqlState} and code ${err.code}`);
      throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
    }
   }

   /**
    * @param {string} projectId
    * @param {string} modifiedBy The AD id of the person who modifies the project
    */
   // TODO: change to query builder
   async updateProjectModifiedDetails (projectId, modified, modifiedBy) {
     this._logger.info(`${TAG}:updateProjectModifiedDetails: Updating the project's modified details for projectId: ${projectId}`);
     const query = `update project set modifiedBy = '${modifiedBy}', modified = '${modified}' where projectId='${projectId}'`;

     try {
       await this._connector.executeQuery(query);
     } catch (err) {
       this._logger.error(`${TAG}:updateProjectModifiedDetails: Error executing query: ${err.sqlMessage} with state ${err.sqlState} and code ${err.code}`);
       throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
     }
   }

   /**
    * Get all the runs for a given project
    * @param {string} clientId
    * @param {string} accountId
    * @param {string} appId
    * @param {string} projectId
    */
   async getAllRunsForAProject(projectId) {
    this._logger.info(`${TAG}:getAllRunsForAProject: Get all runs for projectId: ${projectId}`);
    const query = `select runId, projectId, runName, runDescription, numOfTurns, numOfClusters, stopWords, modified, modifiedBy, created, createdBy, runStatus, runStatusDescription, starred from run where starred=0 and projectId='${projectId}' ORDER BY created DESC`;
    try {
      const response = await this._connector.executeQuery(query);
      return response;
    } catch (err) {
      this._logger.error(`${TAG}:getAllRunsForAProject: Error executing query: ${err.sqlMessage} with state ${err.sqlState} and code ${err.code}`);
      throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
    }
   }

   /**
    * Get run count for a project.
    * @param {*} projectId 
    */
   async getRunCountForProject(projectId) {
     this._logger.info(`${TAG}:getNumOfRunsForAProject: Get all runs for projectId: ${projectId}`);
     let runCount = 0;

     let response;
     const selectQuery = `select count(*) as runCount from run where starred=0 and projectId='${projectId}'`;
     try {
       response = await this._connector.executeQuery(selectQuery);
     } catch (err) {
       this._logger.error(`${TAG}:getNumOfRunsForAProject: Error executing query: ${err.sqlMessage} with state ${err.sqlState} and code ${err.code}`);
       throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
     }

     response = JSON.parse(JSON.stringify(response));
     runCount = response[0].runCount;

     return runCount;
   }

   /**
    * Get the run object for a given runId
    * @param {string} clientId
    * @param {string} accountId
    * @param {string} appId
    * @param {string} projectId
    */
    async getRun(projectId, runId) {
    this._logger.info(`${TAG}:getAllRunsForAProject: Get all runs for projectId: ${projectId}`);
    // TODO validate projectId
    const query = `select runId, projectId, runName, runDescription, numOfTurns, numOfClusters, stopWords, modified, modifiedBy, created, createdBy, runStatus, runStatusDescription, starred, resultURL from run where starred=0 and projectId='${projectId}' and runId='${runId}'`;
    let response;
    try {
      response = await this._connector.executeQuery(query);
    } catch (err) {
      this._logger.error(`${TAG}:getAllRunsForAProject: Error executing query: ${err.sqlMessage} with state ${err.sqlState} and code ${err.code}`);
      throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
    }
     if (ObjectUtils.isEmptyOrNull(response)) {
       return null;
     }
     return response[0];
    }

   /**
    * Update project name and/or project description in database
    *
    * @param clientId
    * @param accountId
    * @param appId
    * @param projectId
    * @param patchParametersToBeUpdated
    * @returns {Promise<boolean>}
    */
   async updateRun(clientId, accountId, appId, projectId, runId, patchParametersToBeUpdated) {
    this._logger.info(`${TAG}:updateRun: Updating Run name and/or description ${clientId}, ${accountId}, ${appId} `);
    const tableName = constants.TABLES.RUN;
    const query = this.buildUpdateRunQuery(patchParametersToBeUpdated, tableName, projectId, runId);
    let response;
    try {
      response = await this._connector.executeQuery(query);
    } catch (err) {
      this._logger.error(`${TAG}:updateRun: Error executing query: ${err.sqlMessage}
       with state ${err.sqlState} and code ${err.code}`);
       if (err.code === constants.DB_ERROR_CODES.ER_DUP_ENTRY) {
        throw new Error(constants.ERRORS.CAA_ALREADY_EXISTS);
      } else {
        throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
        }
    }
    return response !== null && response.changedRows !== 0;
  }

   /**
    * Delete a run from a project.
    *
    * @param clientId
    * @param accountId
    * @param appId
    * @param projectId
    * @param modified
    * @param modifiedBy
    * @returns {Promise<boolean>}
    */
   async deleteRun (clientId, accountId, appId, projectId, runId) {
    this._logger.info(`${TAG}:deleteRun: Deleting a run for ${clientId}, ${accountId}, ${appId}, ${projectId} and ${runId}`);
    const query = `DELETE from run where projectId='${projectId}' and runId='${runId}'`;
    let response;
    try {
      response = await this._connector.executeQuery(query);
    } catch (err) {
      this._logger.error(`${TAG}:deleteRun: Error executing query: ${err.sqlMessage}
       with state ${err.sqlState} and code ${err.code}`);
      throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
    }
    return response !== null && response.affectedRows !== 0;
  }

   /**
    * Gets all the existing ENABLED or DISABLED projects for the given client
    * ENABLED and DISABLED projects is determined by projectStatusEnabled query param.
    * If true, projects returned are ENABLED projects otherwise DISABLED projects.
    * If no param is provided, projectStatusEnabled is true.
    *
    * @param clientId
    * @param accountId
    * @param appId
    * @param projectStatusEnabled
    * @returns {Promise<void>}
    */
   async getProjects(clientId, accountId, appId, projectStatusEnabled) {
     this._logger.info(`${TAG}:getProjects: Getting all the Projects ${clientId}, ${accountId}, ${appId}, ${projectStatusEnabled}`);
     const projectStatusDisabled = constants.PROJECT_STATUS_CODES.DISABLED;
     let caaId = await this.getCAAid(clientId, accountId, appId);
     if (caaId === null) {
       this._logger.warn(`For client ${clientId} account ${accountId} app ${appId} - constants.ERRORS.CAA_DOES_NOT_EXISTS`);
       return Promise.resolve([]);
     }
     const selectQuery = projectStatusEnabled ?
       `select projectId, caaId, projectName, datasetName, modified, modifiedBy, created, createdBy, projectDescription, datasetURL, projectStatus,projectStatusDescription, projectType from project where caaId = '${caaId}' AND projectStatus != '${projectStatusDisabled}' ORDER BY projectStatus, created DESC` :
       `select projectId, caaId, projectName, datasetName, modified, modifiedBy, created, createdBy, projectDescription, datasetURL, projectStatus,projectStatusDescription, projectType from project where caaId = '${caaId}' AND projectStatus = '${projectStatusDisabled}' ORDER BY projectStatus, created DESC`;

     let response;
     try {
       response = await this._connector.executeQuery(selectQuery);
     } catch (err) {
       this._logger.error(`${TAG}:getProjects: Error executing query: ${err.sqlMessage}
        with state ${err.sqlState} and code ${err.code}`);
       throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
     }
     return response;
   }

   /**
    * 
    * @param {*} clientId 
    * @param {*} accountId 
    * @param {*} appId 
    * @param {*} projectName 
    */
   async getProjectByName(clientId, accountId, appId, projectName) {
    this._logger.info(`${TAG}:getProject: Getting the Project ${clientId}, ${accountId}, ${appId}`);
    let caaId = await this.getCAAid(clientId, accountId, appId);
    if (caaId === null || caaId === undefined) {
      throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
    }
    const selectQuery = `select projectId, caaId, projectName, datasetName, modified, modifiedBy, created, createdBy, projectDescription, datasetURL, projectStatus,projectStatusDescription, projectType from project where caaId = '${caaId}' AND projectName = '${projectName}'`;
    let response;
    try {
      response = await this._connector.executeQuery(selectQuery);
    } catch (err) {
      this._logger.error(`${TAG}:getProject: Error executing query: ${err.sqlMessage}
       with state ${err.sqlState} and code ${err.code}`);
      throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
    }
    if (ObjectUtils.isEmptyOrNull(response)) {
      return null;
    }
    return response[0];
  }

   /**
    * Get active project count for a CAA.
    * @param {*} clientId 
    * @param {*} accountId 
    * @param {*} appId 
    * @param {*} projectStatusEnabled 
    */
   async getProjectCountForCAA(clientId, accountId, appId, projectStatusEnabled) {
     this._logger.info(`${TAG}:getNumberOfProjects: Getting number of Projects ${clientId}, ${accountId}, ${appId}, ${projectStatusEnabled}`);
     const projectStatusDisabled = constants.PROJECT_STATUS_CODES.DISABLED;
     let projCount = 0;

     const caaId = await this.getCAAid(clientId, accountId, appId);
     if (caaId !== null) {
       let response;
       const selectQuery = projectStatusEnabled ?
         `select count(*) as projCount from project where caaId = '${caaId}' AND projectStatus != '${projectStatusDisabled}' ORDER BY created DESC` :
         `select count(*) as projCount from project where caaId = '${caaId}' AND projectStatus = '${projectStatusDisabled}' ORDER BY created DESC`;
       try {
         response = await this._connector.executeQuery(selectQuery);
       } catch (err) {
         this._logger.error(`${TAG}:getNumberOfProjects: Error executing query: ${err.sqlMessage} with state ${err.sqlState} and code ${err.code}`);
         throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
       }

       response = JSON.parse(JSON.stringify(response));
       projCount = response[0].projCount;
     }
     return projCount;
   }

   /**
    * Fetch a particular project given its project Id
    *
    * @param clientId
    * @param accountId
    * @param appId
    * @param projectId
    * @returns {Promise<void>}
    */
   async getProject(clientId, accountId, appId, projectId) {
     this._logger.info(`${TAG}:getProject: Getting the Project ${clientId}, ${accountId}, ${appId}`);
     //TODO: Handle the next line under try catch block
     let caaId = await this.getCAAid(clientId, accountId, appId);
     if (caaId === null || caaId === undefined) {
       throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
     }
     const selectQuery = `select projectId, caaId, projectName, datasetName, modified, modifiedBy, created, createdBy, projectDescription, datasetURL, projectStatus,projectStatusDescription, projectType from project where caaId = '${caaId}' AND projectId = '${projectId}'`;
     let response;
     try {
       response = await this._connector.executeQuery(selectQuery);
     } catch (err) {
       this._logger.error(`${TAG}:getProject: Error executing query: ${err.sqlMessage}
        with state ${err.sqlState} and code ${err.code}`);
       throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
     }
     if (ObjectUtils.isEmptyOrNull(response)) {
       return null;
     }
     return response[0];
   }

   /**
    * Fetch a particular project given its project Id
    *
    * @param clientId
    * @param accountId
    * @param appId
    * @param projectId
    * @returns datasetURL
    */
   async getDatasetURL(clientId, accountId, appId, projectId) {
     this._logger.info(`${TAG}:getProjectURL: Getting the Project URL for ${clientId}, ${accountId}, ${appId}`);
     //TODO: Handle the next line under try catch block
     let caaId = await this.getCAAid(clientId, accountId, appId);
     if (caaId === null || caaId === undefined) {
       throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
     }
     const selectQuery = `select datasetURL from project where caaId = '${caaId}' AND projectId = '${projectId}'`;
     let response;
     try {
       response = await this._connector.executeQuery(selectQuery);
     } catch (err) {
     this._logger.error(`${TAG}:getProjectURL: Error executing query: ${err.sqlMessage}
     with state ${err.sqlState} and code ${err.code}`);
     //TODO: Handle Error Object better, add message paramter.
     throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
     }
     return response[0].datasetURL;
   }


     /**
      * Fetch output file location for a particular run
      *
      * @param clientId
      * @param accountId
      * @param appId
      * @param projectId,
      * @param runId
      * @returns datasetURL
      */
     async getResultURL(clientId, accountId, appId, projectId, runId) {
         this._logger.info(`${TAG}:getProjectURL: Getting the Project URL for ${clientId}, ${accountId}, ${appId}`);
         //TODO: Handle the next line under try catch block
         let caaId = await this.getCAAid(clientId, accountId, appId);
         if (caaId === null || caaId === undefined) {
             throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
         }
         const selectQuery = `select resultURL from run where runID = '${runId}' AND projectID = '${projectId}'`;
         let response, resultURL;
         try {
             response = await this._connector.executeQuery(selectQuery);
         } catch (err) {
             this._logger.error(`${TAG}:getResultURL: Error executing query: ${err.sqlMessage}
     with state ${err.sqlState} and code ${err.code}`);
             //TODO: Handle Error Object better, add message paramter.
             throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
         }

         if (response && response[0]) {
          resultURL = response[0].resultURL;
         }

         if (!resultURL) {
          throw new Error(constants.ERRORS.RUN_NOT_FOUND);
         }

         return resultURL;
     }

   /**
    * Update project name and/or project description in database
    *
    * @param clientId
    * @param accountId
    * @param appId
    * @param projectId
    * @param patchParametersToBeUpdated
    * @returns {Promise<boolean>}
    */
   async updateProject(clientId, accountId, appId, projectId, patchParametersToBeUpdated) {
     this._logger.info(`${TAG}:updateProject: Updating Project name and/or description ${clientId}, ${accountId}, ${appId}`);
       let caaId = await this.getCAAid(clientId, accountId, appId);
     if (caaId === null) {
       throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
     }
     const tableName = constants.TABLES.PROJECT;
     let query;
     try {
       query = this.buildUpdateProjectQuery(patchParametersToBeUpdated, tableName, caaId, projectId);
     } catch (err) {
       throw err;
     }
     let response;
     try {
       response = await this._connector.executeQuery(query);
     } catch (err) {
       this._logger.error(`${TAG}:updateProject: Error executing query: ${err.sqlMessage}
        with state ${err.sqlState} and code ${err.code}`);
        if (err.code === constants.DB_ERROR_CODES.ER_DUP_ENTRY) {
          throw new Error(constants.ERRORS.PROJECT_ALREADY_EXISTS);
        } else {
          throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
          }
      }
     return response !== null && response.changedRows !== 0;
   }

   // TODO: consolidate the build update project and run

   buildUpdateProjectQuery(patchParametersToBeUpdated, tableName, caaId, projectId) {
    const queryBuilder = new UpdateQueryBuilder(this._logger).table(tableName);
    Object.keys(patchParametersToBeUpdated).forEach((key) => {
      if (typeof patchParametersToBeUpdated[key] === 'number') {
        queryBuilder.setIntegerUpdateParameters(key, patchParametersToBeUpdated[key]);
      } else if (typeof patchParametersToBeUpdated[key] === 'string') {
        queryBuilder.setStringUpdateParameters(key, patchParametersToBeUpdated[key]);
      } else {
        throw Error (constants.ERRORS.QUERY_BUILDER_DATA_TYPE_NOT_SUPPORTED);
      }
    });
    queryBuilder.setWhereClauseParameters('caaId', caaId, operators.sqlConditionalOperators.EQUAL);
    queryBuilder.setWhereClauseParameters('projectId', projectId, operators.sqlConditionalOperators.EQUAL);
    try {
      return queryBuilder.build();
    } catch (err) {
      throw err;
    }
   }

   buildUpdateRunQuery(patchParametersToBeUpdated, tableName, projectId, runId) {
    const queryBuilder = new UpdateQueryBuilder(this._logger).table(tableName);
    Object.keys(patchParametersToBeUpdated).forEach((key) => {
      if (typeof key === 'number') {
        queryBuilder.setIntegerUpdateParameters(key, patchParametersToBeUpdated[key]);
      } else if (typeof key === 'string') {
        queryBuilder.setStringUpdateParameters(key, patchParametersToBeUpdated[key]);
      } else {
        throw new Error (constants.ERRORS.QUERY_BUILDER_DATA_TYPE_NOT_SUPPORTED);
      }
    });
    queryBuilder.setWhereClauseParameters('runId', runId, operators.sqlConditionalOperators.EQUAL);
    queryBuilder.setWhereClauseParameters('projectId', projectId, operators.sqlConditionalOperators.EQUAL);
    return queryBuilder.build();
   }

   /**
    * Delete project functionality does not delete the project, it disables it, i.e. sets the project status to DISABLED.
    *
    * @param clientId
    * @param accountId
    * @param appId
    * @param projectId
    * @param modified
    * @param modifiedBy
    * @returns {Promise<boolean>}
    */
   async deleteProject (clientId, accountId, appId, projectId, modified, modifiedBy, projectName) {
     this._logger.info(`${TAG}:deleteProject: disabling Project for ${clientId}, ${accountId}, ${appId}`);
     let caaId = await this.getCAAid(clientId, accountId, appId);
     if (caaId === null) {
       throw new Error(constants.ERRORS.CAA_DOES_NOT_EXISTS);
     }
     const projectStatus = constants.PROJECT_STATUS_CODES.DISABLED;
     const query = `UPDATE project SET projectStatus = '${projectStatus}', modified = '${modified}', modifiedBy = '${modifiedBy}', projectName = '${projectName}_DELETE_${modified}' where caaId = '${caaId}' and projectId = '${projectId}'`;
     let response;
     try {
       response = await this._connector.executeQuery(query);
     } catch (err) {
       this._logger.error(`${TAG}:deleteProject: Error executing query: ${err.sqlMessage}
        with state ${err.sqlState} and code ${err.code}`);
       throw new Error(constants.ERRORS.DB_CONNECTION_ERROR);
     }
     return response !== null && response.changedRows !== 0;
   }
}

 module.exports = DataLayer;
