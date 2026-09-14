module.exports = {
  extends: ["../../.eslintrc.js"],
  ignorePatterns: ["node_modules/", ".expo/"],
  overrides: {
    files: ["apps/mobile/**/*.{js,ts,tsx}"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        { devDependencies: ["^expo", "^react-native", "jest"] },
      ],
    },
  },
};
