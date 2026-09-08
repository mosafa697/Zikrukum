const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  { ignores: ['**/*.d.ts'] },
  ...expoConfig,
  {
    rules: {
      'no-console': 'warn',
      // Metro bundler resolves modules differently from Node — disable path checking
      'import/no-unresolved': 'off',
      // SDK 57 ships stricter react-hooks rules; these intentional patterns are not cascading-render bugs
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
    },
  },
];
