import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'
import * as tsconfig from '@lvce-editor/eslint-plugin-tsconfig'
import * as regex from '@lvce-editor/eslint-plugin-regex'

export default [
  ...config.default,
  ...actions.default,
  ...tsconfig.default,
  ...regex.default,
  {
    files: ['packages/chat-tool-worker/src/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'unicorn/no-break-in-nested-loop': 'off',
      'unicorn/no-declarations-before-early-exit': 'off',
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/prefer-minimal-ternary': 'off',
      'unicorn/prefer-number-is-safe-integer': 'off',
      'unicorn/prefer-url-href': 'off',
    },
  },
]
