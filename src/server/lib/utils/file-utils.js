const archiver = require('archiver');
const fs = require('fs');
const constants = require('../constants');

/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
async function zipDirectory(source, out) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream);
    stream.on('close', () => resolve());
    archive.finalize();
  });
}

const removeDatasetFile = async (datasetFilePath, logger) => {
  if (fs.existsSync(datasetFilePath)) {
    await fs.unlink(datasetFilePath, (err) => {
      if (err) {
        logger.error(constants.ERRORS.FAIL_TO_DELETE_DATASET_FILE_FROM_LOCAL);
      }
    });
  }
};

const getFetchAbsolutePath = (url, config) => {
  const mountPath = config.get(constants.NFS_MOUNT_PATH),
    mountPath_DC = config.get(constants.NFS_MOUNT_PATH_DC);

  if (fs.existsSync(`${mountPath}/${url}`)) {
    return `${mountPath}/${url}`;
  } else if (fs.existsSync(`${mountPath_DC}/${url}`)) {
    return `${mountPath_DC}/${url}`;
  }
  return url;
};

const getAbsolutePath = (url, config) => {
  const mountPath = config.get(constants.NFS_MOUNT_PATH);
  return `${mountPath}/${url}`;
};

module.exports = {
  zipDirectory,
  removeDatasetFile,
  getFetchAbsolutePath,
  getAbsolutePath
}