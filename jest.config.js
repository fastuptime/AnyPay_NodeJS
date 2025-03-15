module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
  // Node_modules içindeki bazı modüllerin dönüştürülmesini sağlar
  transformIgnorePatterns: [
    "/node_modules/(?!(axios)/)"
  ],
  // Test ortamında global değişkenleri ayarlar
  globals: {
    NODE_ENV: 'test'
  },
  // Setup dosyası - test ortamı kurulduktan SONRA çalışır
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};
