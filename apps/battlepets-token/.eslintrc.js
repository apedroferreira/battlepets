/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  env: {
    node: true,
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.ts', '.d.ts'],
      },
      typescript: {
        project: './tsconfig.json',
      },
    },
    alias: {
      map: [['@', path.resolve(__dirname, './src')]],
      extensions: ['.js', '.jsx', '.ts', '.d.ts', '.tsx'],
    },
  },
}
