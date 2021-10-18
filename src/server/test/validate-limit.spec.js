const validateLimit = require('../lib/validate-limit');
import DataLayer from '../lib/data-layer';
import mysqlConnector from '../lib/mysql-connector';
import mockLog from '../lib/__mocks__/logger';
let dataLayer;
jest.mock('../lib/mysql-connector');

describe('validate-limit', function () {
  beforeAll(() => {
    dataLayer = new DataLayer(mysqlConnector, mockLog);
    dataLayer.getProjectCountForCAA = jest.fn();
    dataLayer.getRunCountForProject = jest.fn();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('checkProjectLimit', function () {
    test('Should return true if the number of project is below 20', async () => {
      dataLayer.getProjectCountForCAA.mockReturnValue(19);
      const isValid = await validateLimit.checkProjectLimit('client','account','app', dataLayer, mockLog);
      expect(isValid).toEqual(true);
    });

    test('Should return false if the number of project is above 20', async () => {
      dataLayer.getProjectCountForCAA.mockReturnValue(21);
      const isValid = await validateLimit.checkProjectLimit('client','account','app', dataLayer, mockLog);
      expect(isValid).toEqual(false);
    });

    test('Should return false if the number of project is equal to 20', async () => {
      dataLayer.getProjectCountForCAA.mockReturnValue(20);
      const isValid = await validateLimit.checkProjectLimit('client','account','app', dataLayer, mockLog);
      expect(isValid).toEqual(false);
    });
  });

  describe('checkRunLimit', function () {
    test('Should return true if the number of project is below 20', async () => {
      dataLayer.getRunCountForProject.mockReturnValue(19);
      const isValid = await validateLimit.checkRunLimit('project', dataLayer, mockLog);
      expect(isValid).toEqual(true);
    });

    test('Should return false if the number of project is above 20', async () => {
      dataLayer.getRunCountForProject.mockReturnValue(21);
      const isValid = await validateLimit.checkRunLimit('project', dataLayer, mockLog);
      expect(isValid).toEqual(false);
    });

    test('Should return false if the number of project is equal to 20', async () => {
      dataLayer.getRunCountForProject.mockReturnValue(20);
      const isValid = await validateLimit.checkRunLimit('project', dataLayer, mockLog);
      expect(isValid).toEqual(false);
    });
  });
});