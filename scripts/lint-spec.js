/* eslint-disable import/no-extraneous-dependencies, consistent-return */
'use strict';

const fs = require('fs');
const logger = require('fancy-log');
const swagTools = require('swagger-tools-wrapper');

function validateSwaggerApi() {
  //eslint-disable-next-line no-undef
  return new Promise((resolve, reject) => {
    const specPath = `${__dirname}/../src/server/api/swagger.json`;
    fs.readFile(specPath, 'utf-8', (errFS, specString) => {
      if (errFS) {
        return reject(errFS);
      }
      const specObject = JSON.parse(specString);
      swagTools.specs.v2.validate(specObject, (errVal, result) => {
        if (errVal) {
          reject(errVal);
        } else if (result && result.errors && result.errors.length) {
          const errors = result.errors;
          logger.error(`${errors.length} errors!`);
          logger.error(JSON.stringify(errors, undefined, 2));
          reject(new Error(`invalid ${specPath}`));
        } else {
          logger.info(`${specPath} is valid`);
          resolve();
        }
      });
    });
  });
}

validateSwaggerApi().catch(() => { process.exit(); });
