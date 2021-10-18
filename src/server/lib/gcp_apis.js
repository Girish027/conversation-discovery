// const { Storage } = require('@google-cloud/storage');
// const constants = require('./constants');
// // const gcp_store_key = '../config/data-visitor-267420-50dcbfd22a69.json';
// // Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable with your GCP Service Account Credential file to make it work.

// class GcpApis {
//   constructor(logger, config) {
//     this.logger = logger;
//     this.config = config;
//     this.storage = new Storage();

//     this.bucket = this.storage.bucket(this.config.get(constants.GCP_BUCKET_NAME));
//   }

//   // listBuckets() {
//   //   this.storage.getBuckets().then(x => console.log(x));
//   // }

//   async uploadFile(localFilePath, gcpFileName) {
//     return new Promise(async (res, rej) => {
//       await this.bucket.upload(localFilePath, {
//         gzip: true,
//         destination: gcpFileName,
//         metadata: {
//           cacheControl: 'public, max-age=31536000',
//         },
//       })
//         .then((data) => res(data))
//         .catch((err) => {
//           this._logger.error(`Unable to upload dataset file ${err}`);
//           rej(new Error(constants.ERRORS.GCP_UPLOAD_FILE_FAILED));
//         })
//     })
//   }

//   async deleteFile(gcpFilePath) {
//     return new Promise(async (res, rej) => {
//       const file = this.bucket.file(gcpFilePath);
//       if (file) {
//         await this.bucket.file(gcpFilePath).delete()
//         .then((data) => res(data))
//         .catch((err) => {
//           this._logger.error(`Unable to upload dataset file ${err}`);
//           rej(new Error(constants.ERRORS.GCP_DELETE_OBJECT_FAILED));
//         })
//       }
//     })
//   }

//   async downloadFile(gcpFilePath, destinationPath) {
//     const options = {
//       destination:  destinationPath,
//     };
//     // Downloading the file
//     await this.bucket.file(gcpFilePath).download(options);
//   }

// }
// module.exports = GcpApis;
