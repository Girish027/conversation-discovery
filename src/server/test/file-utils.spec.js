import fileUtils from '../lib/utils/file-utils';

describe('file-utils', function () {
  describe('zipDirectory', function () {
    test('should zip the folder', () => {
      fileUtils.zipDirectory('test', 'test.zip');
    });

  });
});