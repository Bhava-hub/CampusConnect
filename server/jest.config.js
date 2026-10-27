module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  testTimeout: 30000,
  collectCoverageFrom: ['controllers/**/*.js', 'middleware/**/*.js', 'routes/**/*.js'],
  reporters: [
    'default',
    ...(process.env.GITHUB_ACTIONS ? ['jest-github-actions-reporter'] : []),
  ],
};