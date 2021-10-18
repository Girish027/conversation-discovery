const ObjectUtils = require('../lib/utils/object-utils')

describe('object-utils', function () {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('isUndefinedOrNull', function () {
    test('should be undefined', () => {
      let test;
      expect(ObjectUtils.isUndefinedOrNull(test)).toEqual(true);
    });

    test('should be null', () => {
      let test = null;
      expect(ObjectUtils.isUndefinedOrNull(test)).toEqual(true);
    });

    test('should be not undefined', () => {
      let test = 'hell';
      expect(ObjectUtils.isUndefinedOrNull(test)).toEqual(false);
    });
  });

  describe('isEmptyOrNull', function () {
    test('should be undefined', () => {
      let test;
      expect(ObjectUtils.isEmptyOrNull(test)).toEqual(true);
    });

    test('should be null', () => {
      let test = null;
      expect(ObjectUtils.isEmptyOrNull(test)).toEqual(true);
    });

    test('should be not undefined', () => {
      let test = 'hell';
      expect(ObjectUtils.isEmptyOrNull(test)).toEqual(false);
    });

    test('should be empty string', () => {
      let test = '';
      expect(ObjectUtils.isEmptyOrNull(test)).toEqual(true);
    });
  });

  describe('isObjectEmpty', function () {
    test('should not be empty', () => {
      let test = {test:'hell'};
      expect(ObjectUtils.isObjectEmpty(test)).toEqual(false);
    });

    test('should be empty', () => {
      let test = {};
      expect(ObjectUtils.isObjectEmpty(test)).toEqual(true);
    });
  });


  describe('removeEmpty', function () {
    test('should remove empty obj', () => {
      let test = {test:'hell', test1 : null};
      expect(ObjectUtils.removeEmpty(test, ['test'])).toEqual({ test: 'hell' });
    });

  });

  describe('removeSpecificKeys', function () {
    test('should remove specific key', () => {
      let test = {test:'hell', test1 : 'hello'};
      expect(ObjectUtils.removeSpecificKeys(test, ['test1'])).toEqual({ test: 'hell' });
    });

  });

  describe('filterSpecificKeys', function () {
    test('should remove specific key', () => {
      let test = {test:'hell', test1 : 'hello'};
      expect(ObjectUtils.filterSpecificKeys(test, ['test'])).toEqual({ test: 'hell' });
    });

  });

  describe('cleanObject', function () {
    test('should remove specific key', () => {
      let test = {test:'hell', test1 : null};
      expect(ObjectUtils.cleanObject(test)).toEqual({ test: 'hell' });
    });

  });


});