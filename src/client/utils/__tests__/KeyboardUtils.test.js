import * as KeyboardUtils from 'utils/KeyboardUtils';

describe('utils/KeyboardUtils', function () {
  describe('shouldHandle', () => {
    test('should give true for Enter Keys by default', () => {
      const event = {
        keyCode: 13
      };
      expect(KeyboardUtils.shouldHandle(event)).toBe(true);
    });

    test('should give true for Escape Keys when listed as accepted', () => {
      const event = {
        keyCode: 27
      };
      expect(KeyboardUtils.shouldHandle(event, ['escape'])).toBe(true);
    });

    test('should give not true for Escape Keys when not listed as accepted', () => {
      const event = {
        keyCode: 27
      };
      expect(KeyboardUtils.shouldHandle(event, ['enter'])).toBe(false);
    });
  });
});
