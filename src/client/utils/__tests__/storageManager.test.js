import { saveStorage, loadStorage, clearStorage } from '../storageManager';
import Constants from 'components/../constants';

const key = 'test_key';
describe('utils/storageUtils', function () {
  describe('saveStorage', () => {
    test('should save the value in local storage with respect to key', () => {
      const value = 'hello';
      saveStorage(key, value);
      const saved = JSON.parse(localStorage.getItem(Constants.localStorageBucket));
      expect(saved[key]).toEqual(value);
    });
  });

  describe('loadStorage', () => {
    test('should retrive the correct value from local storage with respect to key', () => {
      const value = 'hello';
      saveStorage(key, value);
      expect(loadStorage(key)).toEqual(value);
    });
  });

  describe('clearStorage', () => {
    test('should remove the entry from local storage with respect to key', () => {
      const value = 'hello';
      saveStorage(key, value);
      clearStorage(key);
      const saved = JSON.parse(localStorage.getItem(Constants.localStorageBucket));
      expect(saved[key]).toEqual(undefined);
    });
  });
});
