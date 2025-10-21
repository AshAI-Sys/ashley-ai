/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es2022: true,
    browser: true,
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
    {
      files: ["apps/*/src/**/*.{ts,tsx,js,jsx}"],
      extends: ["next/core-web-vitals"],
      rules: {
        "react/no-unescaped-entities": "off",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  ],
};
