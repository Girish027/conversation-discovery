// import amplitude from '../__mocks__/amplitude-js/amplitude';
import { initializeAnalytics, logAmplitudeEvent } from '../amplitudeUtils';

jest.mock('amplitude-js/amplitude');

describe('amplitude', () => {

  const amplitudeApiKey = 'hd383d3893';
  const userName = 'TestUser';
  const userType = 'Internal';

  const eventSpecificData = {
    projectId: '453', modelDBId: '12', modelId: '8eddf9c8-1aac-4aef-b6a0-8ea3ac36e451',
  };

  describe.skip('amplitudeUtils', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('initializeAnalytics', () => {
      test('should getInstance amplitude called', () => {
        initializeAnalytics(amplitudeApiKey, userName);
        expect(amplitude.getInstance).toHaveBeenCalledTimes(1);
      });

      test('should init amplitude called', () => {
        initializeAnalytics(amplitudeApiKey, userName);
        expect(amplitude.getInstance().init).toHaveBeenCalledTimes(1);
        expect(amplitude.getInstance().init).toHaveBeenCalledWith(amplitudeApiKey, userName);
        expect(amplitude.getInstance().init).toHaveReturnedWith('called amplitude init');
      });
    });

    describe('logAmplitudeEvent', () => {
      test('should logEvent called', () => {
        logAmplitudeEvent('TestEvent', eventSpecificData);
        expect(amplitude.getInstance().logEvent).toHaveBeenCalledTimes(1);
        expect(amplitude.getInstance().logEvent).toHaveReturnedWith('called amplitude logEvent');
      });
    });

  });
});
