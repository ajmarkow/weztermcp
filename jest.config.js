export default {
  // Include TypeScript files as test targets
  preset: "ts-jest/presets/default-esm",

  // Enable ES Modules
  extensionsToTreatAsEsm: [".ts"],

  // Set test environment to Node.js
  testEnvironment: "node",

  // Resolve relative imports with .js extension as .ts
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // Test file pattern
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],

  // TypeScript file transform settings
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },

  // Coverage settings
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts", // Excluded (covered separately by integration tests)
    "!**/*.d.ts",
  ],

  // Coverage report formats
  coverageReporters: ["text", "lcov", "html"],
};
