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
    {
      files: ["**/*.ts"],
      rules: {
        "@typescript-eslint/restrict-template-expressions": ['error', { allowNullish: true, allowNumber: true }],
        '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      }
    }
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
  },
  ignorePatterns: ['dist/*', "vite.config.ts"]
}
