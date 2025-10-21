/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  ignorePatterns: [
    "dist/",
    "node_modules/",
    ".turbo/",
    "build/",
    ".next/",
    "coverage/",
    "*.d.ts",
  ],
  rules: {
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "prefer-const": "error",
  },
  overrides: [
    // Test files at root level - allow Jest globals and any patterns
    {
      files: ["tests/**/*.{ts,tsx,js,jsx}", "e2e/**/*.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
      env: {
        jest: true,
        node: true,
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-unused-vars": "off",
        "no-console": "off",
        "no-undef": "off", // TypeScript checks this
      },
    },
  ],
};
