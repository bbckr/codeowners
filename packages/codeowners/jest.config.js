module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // Transform TypeScript files
    "^.+\\.(js|jsx|mjs)$": "babel-jest", // Handle ES modules with Babel
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(find-up)/)", // Allow Jest to transform ESM dependencies
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
