const fs = require('fs-extra');
const CONFIG_KEY = require('./constants');
const FileUtils = require('../lib/utils/file-utils');

class NfsApis {
  constructor(logger, config) {
    this._logger = logger;
    this.config = config;
    this.mountPath = this.config.get(CONFIG_KEY.NFS_MOUNT_PATH);
  }

  async uploadFile(localFilePath, nfsFileLocation, nfsFileName) {
    const absNfsFileLocation = FileUtils.getAbsolutePath(nfsFileLocation, this.config);
    const absNfsFileName = `${absNfsFileLocation}/${nfsFileName}`;
    const relNfsFileName = `${nfsFileLocation}/${nfsFileName}`;

    fs.ensureDirSync(absNfsFileLocation, '0777');
    fs.chmodSync(absNfsFileLocation, '0777');
    fs.ensureFileSync(absNfsFileName);

    return new Promise(async (res, rej) => {
      fs.copy(localFilePath, absNfsFileName)
        .then(() => {
          res(relNfsFileName);
        })
        .catch(err => {
          this._logger.error(`Unable to upload dataset file ${err}`);
          rej(new Error(CONFIG_KEY.ERRORS.NFS_UPLOAD_FILE_FAILED));
        })
    })
  }

  async deleteFile(nfsFilePath) {
    const absNfsFilePath = FileUtils.getFetchAbsolutePath(nfsFilePath, this.config);
    return new Promise(async (res, rej) => {
      fs.remove(absNfsFilePath)
        .then(() => {
          this._logger.info('Delete successful');
          res(absNfsFilePath);
        })
        .catch(err => {
          this._logger.error(`Unable to delete dataset file ${err}`);
          rej(new Error(CONFIG_KEY.ERRORS.NFS_DELETE_OBJECT_FAILED));
        })
    })
  }

  async downloadFile(nfsFilePath, destinationPath) {
    const absNfsFilePath = FileUtils.getFetchAbsolutePath(nfsFilePath, this.config);
    return new Promise(async (res, rej) => {
      fs.copy(absNfsFilePath, destinationPath)
        .then(() => {
          res(destinationPath);
        })
        .catch(err => {
          this._logger.error(`Unable to download dataset file ${err}`);
          rej(new Error(CONFIG_KEY.ERRORS.NFS_DOWNLOAD_FILE_FAILED));
        })
    })
  }
}
module.exports = NfsApis;
