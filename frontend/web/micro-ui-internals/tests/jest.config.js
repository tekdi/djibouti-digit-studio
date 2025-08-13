module.exports = {
    // Test environment
    testEnvironment: 'jsdom',

    // Root directory for tests
    rootDir: '.',

    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.(js|jsx|ts|tsx)',
        '**/*.(test|spec).(js|jsx|ts|tsx)'
    ],

    // Module file extensions
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

    // Transform files before testing
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
        '^.+\\.css$': 'jest-transform-stub',
        '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
    },

    // Module name mapping for CSS modules and assets
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // Coverage configuration
    collectCoverageFrom: [
        '../packages/**/*.{js,jsx,ts,tsx}',
        '!../packages/**/node_modules/**',
        '!../packages/**/dist/**',
        '!../packages/**/build/**',
        '!../packages/**/*.stories.{js,jsx,ts,tsx}',
        '!../packages/**/index.js'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },

    // Coverage directory
    coverageDirectory: 'coverage',

    // Coverage reporters
    coverageReporters: ['text', 'lcov', 'html'],

    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/'
    ],

    // Clear mocks between tests
    clearMocks: true,

    // Verbose output
    verbose: true
}; 