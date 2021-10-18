export const mockInfo = jest.fn();
export const mockError = jest.fn();
export const mockDebug = jest.fn();
export const mockWarn = jest.fn();
export const mockLogger = jest.fn();

mockLogger.info = mockInfo;
mockLogger.error = mockError;
mockLogger.debug = mockDebug;
mockLogger.warn = mockWarn;

export default mockLogger;