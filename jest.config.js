module.exports = {
  // Test configuration for Ashley AI
  displayName: 'Ashley AI Test Suite',

  // Test patterns
  testMatch: [
    '<rootDir>/services/**/src/**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/packages/**/src/**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'services/**/src/**/*.{js,jsx,ts,tsx}',
    'packages/**/src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js'
  ],

  // Module path mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/services/ash-admin/src/$1',
    '^@ash/(.*)$': '<rootDir>/packages/$1/src',
    '^@ash-ai/(.*)$': '<rootDir>/packages/$1/src',
    '^~/(.*)$': '<rootDir>/tests/$1'
  },

  // Test environment
  testEnvironment: 'jsdom',

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },

  // Mock configuration
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],

  // Clear mocks
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Parallel testing
  maxWorkers: '50%',

  // Test timeout
  testTimeout: 10000
}