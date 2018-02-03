module.exports = {
  extends: ['prettier', 'prettier/flowtype'],
  rules: {
    'prettier/prettier': ['error'],
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'class-methods-use-this': 'off',
    'no-unused-vars': 2,
    'no-undef': 2
  },
  ecmaFeatures: {
    modules: true,
    spread: true,
    restParams: true
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  plugins: ['flowtype', 'prettier'],
  globals: {}
};
