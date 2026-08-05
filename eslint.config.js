const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  { ignores: ['**/*.d.ts'] },
  ...expoConfig,
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Metro bundler resolves modules differently from Node — disable path checking
      'import/no-unresolved': 'off',
    },
  },
];
