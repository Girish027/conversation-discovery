const config = require('./jest.config');

config.testMatch = [
  "<rootDir>/src/server/api/*apispec.{js,jsx,mjs}",
];
config.testEnvironment = 'node';
console.log('RUNNING INTEGRATION TESTS');
module.exports = config;
