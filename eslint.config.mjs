import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores(["**/dist", "**/.next", "**/node_modules"]),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        process: "readonly",
        __dirname: "readonly",
        require: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "import": importPlugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,

      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      // Type-aware rules require parserOptions.projectService; disabled for
      // non-type-checked lint (typecheck runs separately via `pnpm -r typecheck`).
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      "import/no-unresolved": "error",
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: { extensions: [".ts", ".tsx"] },
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        { devDependencies: ["^next", "^react", "^react-dom", "vite"] },
      ],
    },
  },
  {
    files: ["apps/mobile/**/*.{ts,tsx}"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        { devDependencies: ["^expo", "^react-native", "vite"] },
      ],
    },
  },
]);
