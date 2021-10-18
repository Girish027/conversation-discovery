module.exports = {
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!*.{js,jsx}',
    '!src/client/**/index.js',
    '!**/*.test.{js,jsx}',
    '!**/*.spec.{js,jsx}',
    '!**/test/**',
    '!**/mockServer.js',
    '!**/gulpfile.js',
    '!**/serviceWorker.js',
    '!**/client/store/**',
    '!**/config/**',
    '!**/dist/**',
    '!**/scripts/**',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/index.js',
    '<rootDir>/src/client/wdio',
    '<rootDir>/src/client/index.js',
    '<rootDir>/*.config.js'
  ],
  coverageReporters: ['json', 'lcov', 'text', 'html', 'cobertura'],
  coverageThreshold: {
    './src/client/': {
      branches: 0,
      statements: 0
    },
    './src/server/': {
      branches: 0,
      statements: 0
    }
  },
  setupFiles: [
    '<rootDir>/config/polyfills.js'
  ],
  testMatch: [
    '**/__tests__/**/*.{js,jsx,mjs}',
    '**/?(*.)(spec|test).{js,jsx,mjs}'
  ],
  testURL: 'http://localhost',
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'
  ],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '.*\\.(css|less|styl|scss|sass)$':
      '<rootDir>/config/jest-mocks/cssMocks.js',
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest-mocks/imageMock.js',
    '.*\\.(svg)$':
      '<rootDir>/config/jest-mocks/svgMock.js'
  },
  moduleDirectories: ['node_modules', 'src', 'src/client', 'src/server'],
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'node',
    'web.jsx',
    'web.js',
    'mjs'
  ],
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js']
}
