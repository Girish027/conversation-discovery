const timeout = process.env.NODE_ENV === 'debug' ? 99999999 : 20000;
const logLevel = process.env.NODE_ENV === 'debug' ? 'verbose' : 'silent';

const specs = process.env.REQUIRE_OKTA_AUTHENTICATION == 1
  ? ['./src/client/wdio/**/*-okta_authentication_spec.js']
  : ['./src/client/wdio/**/*-uispec.js'];

const exclude = process.env.REQUIRE_OKTA_AUTHENTICATION == 1
  ? ['./src/client/wdio/**/*-uispec.js']
  : ['./src/client/wdio/**/*-okta_authentication_spec.js'];

exports.config = {
  // Uncomment and add user/key values to use Browserstack
  // user: '<user>',
  // key: '<access_key>',
  // browserstackLocal: true,
  services: ['selenium-standalone'], // add 'browerstack' to use Browserstack
  specs,
  exclude,
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome'
  }],
  sync: true,
  logLevel,
  coloredLogs: true,
  deprecationWarnings: true,
  bail: 0,
  screenshotPath: './src/client/wdio/errorShots/',
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout
  },
  reporters: ['dot', 'spec']
};
