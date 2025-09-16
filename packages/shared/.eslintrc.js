module.exports = {
  extends: [
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  env: {
    node: true,
    es2022: true
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '.turbo',
    '*.js',
    '*.d.ts'
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
}