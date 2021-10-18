import * as DateUtils from 'utils/DateUtils';

describe('utils/DateUtils', function () {

  describe('formatTimestamp', () => {
    test('should get the date string in the default format', () => {
      const timestamp = '1563223611959';
      const formatted = DateUtils.formatTimestamp(timestamp);
      expect(formatted).toMatch(/Jul \d{1,2}, \d{1,2}:\d{1,2} (PM|AM)/);
    });

    test('should get the date string in the given format', () => {
      const timestamp = 1563223611959;
      const formatted = DateUtils.formatTimestamp(timestamp, 'mmmm d, h:MM:ss TT');
      expect(formatted).toMatch(/July \d{1,2}, \d{1,2}:\d{1,2}:\d{1,2} (PM|AM)/);
    });
  });
});
