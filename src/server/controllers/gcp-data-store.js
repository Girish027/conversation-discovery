const constants = require('../lib/constants');

class GcpDataStore {
  constructor(dataStore, logger, config) {
    this._logger = logger;
    this._config = config;
    this.dataStore = dataStore;
  }

  async uploadDataset(caaId, projectId, localFilePath, filename) {
    const env = this._config.get(constants.ENV);
    return this.dataStore.uploadFile(localFilePath, this.createGcpDatasetDirPath(env, caaId, projectId), filename);
  }

  async uploadSystemDataset(destinationPath, localFilePath, filename) {
    return this.dataStore.uploadFile(localFilePath, destinationPath, filename, true);
  }

  async deleteDataset(gcpFilePath) {
    return this.dataStore.deleteFile(gcpFilePath);
  }

  async downloadResults(gcpFilePath, destinationPath) {
    return this.dataStore.downloadFile(gcpFilePath, destinationPath);
  }

  createGcpDatasetDirPath(env, caaId, projectId) {
    return `${env}/${caaId}/${projectId}`
  }

}

module.exports = GcpDataStore;
