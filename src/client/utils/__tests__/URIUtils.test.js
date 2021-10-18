import * as URIUtils from 'utils/URIUtils';

describe('utils/URIUtils', function () {
  describe('getURLParams', () => {
    test('should extract the url params from the input url', () => {
      const url = 'http://abc.com?client=247&account=refbot&app=refapp';
      expect(URIUtils.getURLParams(url)).toMatchSnapshot();
    });

    test('should extract the url params from the input data eg:search', () => {
      const url = '?client=247&account=refbot&app=refapp';
      expect(URIUtils.getURLParams(url)).toMatchSnapshot();
    });

    test('should extract the url params from the input data eg:hash', () => {
      const url = '#test?client=247&account=refbot&app=refapp';
      expect(URIUtils.getURLParams(url)).toMatchSnapshot();
    });

    test('should give empty object when url params is not present', () => {
      const url = 'http://abc.com#test';
      expect(URIUtils.getURLParams(url)).toMatchSnapshot();
    });
  });
});
