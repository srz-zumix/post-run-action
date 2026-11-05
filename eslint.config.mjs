// See: https://eslint.org/docs/latest/use/configure/configuration-files

import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import jest from 'eslint-plugin-jest'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  {
    ignores: ['**/coverage', '**/dist', '**/linter', '**/node_modules']
  },
  js.configs.recommended,
  ...typescriptEslint.configs['flat/recommended'],
  jest.configs['flat/recommended'],
  prettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      },

      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: 'module',

      parserOptions: {
        project: ['tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname
      }
    },

    rules: {
      camelcase: 'off',
      'eslint-comments/no-use': 'off',
      'eslint-comments/no-unused-disable': 'off',
      'i18n-text/no-en': 'off',
      'no-console': 'off',
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'error'
    }
  }
]
