module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  modulePaths: ["<rootDir>"],
  collectCoverageFrom: ["src/**/*.ts", "!src/types/**", "!src/db/migrations/**", "!src/**/*.test.ts"],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          paths: {
            "@/*": ["./src/*"],
          },
        },
      },
    ],
  },
};
