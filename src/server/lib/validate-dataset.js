const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const constants = require('./constants');
const readline = require('readline');
const EOL = require('os').EOL
const DELIMETER = ',';

const isDatasetValid = async (datasetFile, csvFile) => {

  // First check if csv file
  if (csvFile.split('.').pop() != 'csv') {
    throw Error(constants.ERRORS.DATASET_FILE_IS_NOT_CSV);
  }

  //Second, check if the number of columns are 4
  const validNumberOfColumns = await isDatasetFileHas4Columns(datasetFile);
  if (!validNumberOfColumns) {
    throw Error(constants.ERRORS.DATASET_FILE_DOES_NOT_HAVE_FOUR_COLUMNS);
  }

  //Third, check if the Data has non ascii Characters
  const validity = await asciiCheck(datasetFile);
  if (!validity) {
    throw Error(constants.ERRORS.FAILURE_DUE_TO_NON_ASCII_CHARACTERS_IN_DATASET);
  }
  return true;
};

const asciiCheck = async (datasetFile) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(datasetFile)
      .pipe(csv())
      .on('data', (data) => {
        if (data) {
          Object.keys(data).forEach((elementKey) => {
            data[elementKey].split('').some((char) => {
              if (char.charCodeAt(0) > 127) { resolve(false) }
            });
          })
        }
        resolve(true)
      })
      .on('error', () => reject(false));
  });
};

const isDatasetFileHas4Columns = async (datasetFile) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(datasetFile)
      .pipe(csv())
      .on('headers', (headers) => {
        if (headers.length !== 4) {
          resolve(false)
        }
        resolve(true)
      })
      .on('error', () => reject(false));
  });

};

const maskPIIData = async (datasetFile, maskedFileUploadPath) => {
  var file = path.basename(datasetFile);
  const maskedFileName = file + '_masked';
  const maskedFilePath = maskedFileUploadPath + '/' + maskedFileName;
  const maskedFile = fs.createWriteStream(maskedFilePath);
  const readInterface = readline.createInterface({
    input: fs.createReadStream(datasetFile),
    console: false
  });

  for await (const line of readInterface) {
    let i = indexOfNth(line, DELIMETER, 3, 0)
    let textTobeMasked = line.substring(i + 1)
    let maskedText = textTobeMasked
      .replace(/\S+@\S+\.[\w|\d]+/g, constants.PII_MASK_REGEX.MASKED_EMAILID)
      .replace(/\d/g, constants.PII_MASK_REGEX.MASKED_DIGITS)
      .replace(/<(iframe|img|script)\b[^>]*>/g, constants.PII_MASK_REGEX.MASKED_SCRIPT_TAGS)
      .replace(/<\b[^>]*src=[^>]*>/g, constants.PII_MASK_REGEX.MASKED_SCRIPT_TAGS);
    let columnsInLine = line.split(DELIMETER);
    let maskedLine = [columnsInLine[0], columnsInLine[1], columnsInLine[2], maskedText].filter(Boolean).join(DELIMETER) + EOL;
    maskedFile.write(maskedLine)
  }
  return maskedFile;
};

function indexOfNth(string, char, nth, fromIndex = 0) {
  let indexChar = string.indexOf(char, fromIndex);
  if (indexChar === -1) {
    return -1;
  } else if (nth === 1) {
    return indexChar;
  } else {
    return indexOfNth(string, char, nth - 1, indexChar + 1);
  }
}

module.exports = {
  isDatasetValid,
  maskPIIData,
  indexOfNth
}
