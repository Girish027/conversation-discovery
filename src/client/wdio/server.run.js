// append to index.js after removing `server.run` for webdriver.io tests
/* eslint-disable no-console, no-undef */
const getPort = require('get-port');
const { Launcher } = require('webdriverio');
const wdioConfig = libPath.resolve(__dirname, './src/client/wdio/wdio.conf.js');
const { LISTEN_PORT_CONFIG_KEY } = require('./src/server/lib/constants');

getPort({ port: process.env.LISTEN_PORT || config.get(LISTEN_PORT_CONFIG_KEY) })
  .then((testPort) => {
    console.log('testPort', testPort);
    server.run(testPort);
    const wdio = new Launcher(wdioConfig, { baseUrl: `http://localhost:${testPort}/` });
    const handleError = (error) => {
      console.error('Launcher failed while running the test suite', error.stacktrace);
      server.close('SIGTERM');
    };
    const handleSuccess = (code) => {
      console.log('test suite run is finished');
      process.exit(code);
    };
    wdio.run().then(handleSuccess, handleError).catch(handleError);
  });
