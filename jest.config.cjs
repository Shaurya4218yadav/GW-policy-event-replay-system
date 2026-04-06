module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'app/api/**/*.js',
    '!app/api/**/route.js', // Exclude Next.js route files
  ],
  setupFilesAfterEnv: [],
  testTimeout: 10000, // 10 second timeout for API tests
};