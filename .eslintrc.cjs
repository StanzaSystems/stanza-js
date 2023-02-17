module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'standard-with-typescript'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  plugins: [
    'react'
  ],
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    "@typescript-eslint/restrict-template-expressions": ['error', { allowNullish: true, allowNumber: true }]
  },
  ignorePatterns: ['dist/*']
}
