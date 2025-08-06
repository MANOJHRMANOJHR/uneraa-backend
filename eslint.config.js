export const env = {
  node: true,
  es2021: true,
};
// export const extends = [
//   'eslint:recommended',
//   'plugin:@typescript-eslint/recommended',
//   'prettier',
// ];
export const parser = '@typescript-eslint/parser';
export const parserOptions = {
  ecmaVersion: 12,
  sourceType: 'module',
};
export const plugins = ['@typescript-eslint', 'prettier'];
export const rules = {
  'prettier/prettier': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: false,
    },
  ],
};
