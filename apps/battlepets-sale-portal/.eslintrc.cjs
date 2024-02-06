const path = require('path')

module.exports = {
  env: { browser: true, es2020: true },
  extends: ['plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:react-hooks/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.d.ts', '.tsx'],
      },
      typescript: {
        project: './tsconfig.json',
      },
      alias: {
        map: [['@', path.resolve(__dirname, './src')]],
        extensions: ['.js', '.jsx', '.ts', '.d.ts', '.tsx'],
      },
    },
  },
  rules: {
    'react-refresh/only-export-components': [1, { allowConstantExport: true }],
    'react/prop-types': 0,
  },
}
