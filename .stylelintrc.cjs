module.exports = {
  customSyntax: 'postcss-scss',
  ignoreFiles: ['**/node_modules/**', '**/.next/**'],
  rules: {
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['apply', 'config', 'layer', 'tailwind', 'variants', 'responsive', 'screen'],
    }],
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'declaration-block-no-duplicate-properties': [true, {
      ignore: ['consecutive-duplicates-with-different-values'],
    }],
    'no-duplicate-selectors': true,
    'property-no-unknown': true,
  },
};
