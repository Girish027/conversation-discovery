
const fs = require('fs-extra');
const constants = require('../../lib/constants');

class NfsDataStoreMock {
  constructor(dataStore, logger, config) {
    this._logger = logger;
    this._config = config;
    this.dataStore = dataStore;
  }

  async uploadDataset(caaId, projectId, localFilePath, filename) {
    this._logger.info('uploadDataSet Mock called for - ' + caaId + '|' + projectId + '|' + localFilePath + '|' + filename);
    return 'default';
  }

  async deleteDataset(nfsFilePath) {
    this._logger.info('deleteDataSet mock called for - '+ nfsFilePath);
    return 'default';
  }

  async downloadResults(nfsFilePath, destinationPath) {
    return new Promise(async (res, rej) => {
      fs.copy(nfsFilePath, destinationPath)
        .then(() => {
          res(destinationPath);
        })
        .catch((err) => {
          this._logger.error(`Unable to download dataset file ${err}`);
          rej(new Error(constants.ERRORS.NFS_DOWNLOAD_FILE_FAILED));
        });
    })
  }
}

module.exports = NfsDataStoreMock;