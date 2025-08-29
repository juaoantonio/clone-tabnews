const dotenv = require("dotenv");
const nextJest = require("next/jest");

dotenv.config({
  path: [".env", ".env.development"],
});

const createJestConfig = nextJest({
  dir: ".",
});
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  maxWorkers: 1,
  injectGlobals: true,
  testTimeout: 60_000, // 60 seconds
  moduleNameMapper: {
    "^@pages/(.*)$": "<rootDir>/pages/$1",
    "^@infra/(.*)$": "<rootDir>/infra/$1",
    "^@models/(.*)$": "<rootDir>/models/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
  },
});

module.exports = jestConfig;
