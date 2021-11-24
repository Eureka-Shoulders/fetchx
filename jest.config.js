module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json', 'node'],
  roots: ['tests'],
  testEnvironment: 'jest-environment-jsdom', // Use browser-like testing environment
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['\\\\node_modules\\\\'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // That one tells Jest to use ts-jest when dealing with TypeScript files
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};
