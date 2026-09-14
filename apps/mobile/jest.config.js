module.exports = {
  rootDir: __dirname,
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^@rovotools/(.*)$": "<rootDir>/../../packages/$1/src/index.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: "node",
};
