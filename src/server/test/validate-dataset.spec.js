const fs = require('fs');
const fastcsv = require('fast-csv');
const validateDataset = require('../lib/validate-dataset');
const constants = require('../lib/constants');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

// const maskedFile = require('./test-files/dataset_masked_output.csv');

describe('validate-dataset', function () {
  
  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.setTimeout(30000);
  });
  
  describe('isDatasetValid', function () {
    test('should reject if not a csv file', () => {
      expect(validateDataset.isDatasetValid(__dirname + '/test-files/dataset-invalid-noncsv', 'dataset-invalid-noncsv')).rejects.toEqual(new Error(constants.ERRORS.DATASET_FILE_IS_NOT_CSV));
    });

    test('should reject if the dataset is not having 4 columns', () => {
      expect(validateDataset.isDatasetValid(__dirname + '/test-files/dataset-invalid-3columns.csv', 'dataset-invalid-3columns.csv')).rejects.toEqual(new Error(constants.ERRORS.DATASET_FILE_DOES_NOT_HAVE_FOUR_COLUMNS));
    });

    test('should reject if the dataset is ascii character', () => {
      expect(validateDataset.isDatasetValid(__dirname + '/test-files/dataset-invalid-ascii.csv', 'dataset-invalid-ascii.csv')).rejects.toEqual(new Error(constants.ERRORS.FAILURE_DUE_TO_NON_ASCII_CHARACTERS_IN_DATASET));
    });

    test('should verify if the dataset is valid', () => {
      expect(validateDataset.isDatasetValid(__dirname + '/test-files/dataset.csv', 'dataset.csv')).resolves.toEqual(true);
    });

    test('should mask pii/pci email data', async () => {
      const masked = await validateDataset.maskPIIData(__dirname + '/test-files/dataset-mask-email.csv', __dirname + '/test-files');
      let stream = fs.createReadStream(masked.path);
      let csvStream = fastcsv.parse()
        .on('data', function (data) {
          if (data) {
            expect(data[3]).toEqual('my email id is  abc@xyz.com');
          }
        })
        .on('end', function () {
        });
      await pipeline(stream, csvStream);
    });

    test('should mask pii/pci number data', async () => {
      const masked = await validateDataset.maskPIIData(__dirname + '/test-files/dataset-mask-number.csv', __dirname + '/test-files');
      let stream = fs.createReadStream(masked.path);
      let csvStream = fastcsv.parse()
        .on('data', function (data) {
          if (data) {
            expect(data[3]).toEqual('my contact number is ####-###-###');
          }
        })
        .on('end', function () {
        });
      await pipeline(stream, csvStream);
    });

    test('should mask scripting tags from data', async () => {
      const masked = await validateDataset.maskPIIData(__dirname + '/test-files/dataset-mask-script.csv', __dirname + '/test-files');
      let stream = fs.createReadStream(masked.path);
      let csvStream = fastcsv.parse()
        .on('data', function (data) {
          if (data) {
            expect(data[3]).toEqual('tag -  and  and  and src attribute ');
          }
        })
        .on('end', function () {
        });
      await pipeline(stream, csvStream);
    });

    test('when invalid inputs given for IndexofNth Function', () => {
      let index = validateDataset.indexOfNth('Test', 'T', 1);
      expect(index).toEqual(0);
    });

    test('when invalid inputs given for IndexofNth Function', () => {
      let index = validateDataset.indexOfNth('', 'T', 1);
      expect(index).toEqual(-1);
    });
  });
});