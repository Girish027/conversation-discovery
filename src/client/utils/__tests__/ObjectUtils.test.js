import ObjectUtils from '../ObjectUtils';
describe('ObjectUtils', function () {
  let clusterList = [{
    clusterId: '1',
    clusterName: 'cancel_order_customer_service',
    originalName: 'cancel_order_customer_service',
    clusterDescription: 'relates to cancel order',
    rollupCluster: 'Cancel_Order',
    suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
    count: 230,
    finalized: false,
    modifiedBy: 'user1@247.ai',
    modified: 1554930400001,
    finalizedBy: '',
  }, {
    clusterId: '2',
    clusterName: 'Cancel_Order',
    originalName: 'Cancel_Order',
    clusterDescription: 'order canceled',
    rollupCluster: 'Cancel_Order',
    suggestedNames: ['cancel_order_service', 'abcde', 'defg'],
    count: 400,
    finalized: false,
    modifiedBy: 'user1@247.ai',
    modified: 1554930400002,
    finalizedBy: '',
  }];

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