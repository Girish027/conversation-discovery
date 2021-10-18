import * as stringUtils from 'utils/stringOperations';

describe('utils/stringOperations', function () {
  describe('convertFirstLetterUppercase', () => {
    test('should title case sentence', () => {
      const str = 'should title case sentence';
      expect(stringUtils.convertFirstLetterUppercase(str)).toEqual('Should Title Case Sentence');
    });
  });
});
