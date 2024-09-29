/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // Handle TypeScript files
    "^.+\\.(js|jsx|mjs)$": "babel-jest", // Handle JavaScript/ES modules with Babel
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  projects: ["<rootDir>/packages/codeowners"],
};
