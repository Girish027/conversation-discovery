const amplitudeUtils = jest.genMockFromModule('../amplitudeUtils');

amplitudeUtils.initializeAnalytics = jest.fn((analyticsKey, userName = '') => 'called initializeAnalytics');

amplitudeUtils.logAmplitudeEvent = jest.fn((eventName, eventSpecificData = {}) => 'called logAmplitudeEvent');

module.exports = amplitudeUtils;
