import appLogger from 'utils/appLogger';

describe('AppLogger', () => {
  const anonymous = () => {};
  const response = {
    debug: anonymous,
    error: anonymous,
    info: anonymous,
    trace: anonymous,
    warn: anonymous
  };


  it('Should return object with anonymous functions', () => {
    expect(JSON.stringify(appLogger({ tag: 'authenticationState' }))).toBe(JSON.stringify(response));
  });

  it('Should log on console if methodLevel is greater than logLevel', () => {
    const devlog = appLogger({ tag: 'authenticationState' });

    jest.spyOn(global.console, 'log');
    devlog.error('testing console log');

    /* eslint-disable no-alert, no-console */
    expect(console.log).toHaveBeenCalledWith('authenticationState', 'testing console log');
  });
});
