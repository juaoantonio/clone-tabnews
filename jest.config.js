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
  injectGlobals: false,
});

module.exports = jestConfig;
