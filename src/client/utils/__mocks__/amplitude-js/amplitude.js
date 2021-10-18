const amplitude = jest.genMockFromModule('amplitude-js/amplitude');

const MOCK_FUNC_OBJECT = { init: jest.fn((amplitudeApiKey, name) => 'called amplitude init'), logEvent: jest.fn((eventName, eventProperties = {}) => 'called amplitude logEvent') };

amplitude.getInstance = jest.fn(() => MOCK_FUNC_OBJECT);

export default amplitude;
