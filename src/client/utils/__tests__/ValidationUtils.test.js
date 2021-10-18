import * as ValidationUtils from 'utils/ValidationUtils';
import Language from '../../Language';
import Constants from '../../constants';

describe('utils/ValidationUtils', function () {
  describe('validateLength', () => {
    test('should check that length in given range', () => {
      expect(ValidationUtils.validateLength('hello', 5, 50)).toBe(true);
    });

    test('should check that length with default range', () => {
      expect(ValidationUtils.validateLength('hello')).toBe(true);
    });

    test('negative case : should check that length in given range : min', () => {
      expect(ValidationUtils.validateLength('hello', 10, 50)).toBe(false);
    });

    test('negative case : should check that length in given range : max', () => {
      expect(ValidationUtils.validateLength('hello', 1, 3)).toBe(false);
    });
  });

  describe('validateProjectDetails', () => {
    test('should fail if either projectname or datasetname is not valid', () => {
      expect(ValidationUtils.validateProjectDetails('test','')).toBe(false);
      expect(ValidationUtils.validateProjectDetails('', 'test')).toBe(false);
      expect(ValidationUtils.validateProjectDetails('test', 'test')).toBe(false);
    });

    test('should pass if both project and dataset name are valid', () => {
      expect(ValidationUtils.validateProjectDetails('project', 'data.csv')).toBe(true);
    });
  });

  describe('validateClientProjLimit', () => {
    test('should check that project length is within limit', () => {
      expect(ValidationUtils.validateClientProjLimit(5)).toBe(false);
    });

    test('should check that project length is above limit', () => {
      expect(ValidationUtils.validateClientProjLimit(25)).toBe(true);
    });
  });

  describe('validateClientRunLimit', () => {
    test('should check that run length is within limit', () => {
      expect(ValidationUtils.validateClientRunLimit(5)).toBe(false);
    });

    test('should check that run length is above limit', () => {
      expect(ValidationUtils.validateClientRunLimit(25)).toBe(true);
    });
  });

  describe('createProjectValidation', () => {
    test('should check clientId is there and numProj is under limit', () => {
      const isValidObj = {
        isValid: true,
        message: ''
      };
      expect(ValidationUtils.createProjectValidation(5,'testclientone')).toStrictEqual(isValidObj);
    });

    test('should check clientId is not there', () => {
      const isValidObj = {
        isValid: false,
        message: Language.ERROR_MESSAGES.clientInfoNotAvailable
      };
      expect(ValidationUtils.createProjectValidation(5,undefined)).toStrictEqual(isValidObj);
    });

    test('should check clientId is not there & limit exceeded', () => {
      const isValidObj = {
        isValid: false,
        message: Language.ERROR_MESSAGES.clientInfoNotAvailable
      };
      expect(ValidationUtils.createProjectValidation(25,undefined)).toStrictEqual(isValidObj);
    });

    test('should check clientId is there & limit exceeded', () => {
      const isValidObj = {
        isValid: false,
        message: Language.ERROR_MESSAGES.maxProjectNumberExceeded(Constants.PROJ_LIMIT)
      };
      expect(ValidationUtils.createProjectValidation(25,'testclientone')).toStrictEqual(isValidObj);
    });
  });


});
