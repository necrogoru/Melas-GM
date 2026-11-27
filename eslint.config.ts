import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import type { Linter } from 'eslint'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

const sharedRules: Linter.RulesRecord = {
  '@typescript-eslint/no-explicit-any': 'error',
  'quotes': ['error', 'single'],
  'semi': [2, 'never'],
  'no-console': 'off',
  'no-debugger': 'off',
  'curly': ['error', 'multi-line'],
  '@stylistic/comma-dangle': ['error', 'never'],
  '@stylistic/brace-style': ['error', '1tbs'],
  '@stylistic/indent': ['error', 2, {
    SwitchCase: 1
  }],
  'no-multiple-empty-lines': ['error', { max: 1 }],
  '@typescript-eslint/no-unused-vars': ['error', {
    args: 'all',
    argsIgnorePattern: '^_',
    caughtErrors: 'all',
    caughtErrorsIgnorePattern: '^_',
    destructuredArrayIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    ignoreRestSiblings: false
  }],
  'no-undef': 'error'
}

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}']
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*']
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  {
    name: 'app/shared-rules',
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@stylistic': stylistic
    },
    rules: sharedRules
  },

  {
    name: 'app/vue-rules',
    files: ['**/*.vue'],
    rules: {
      ...sharedRules,
      '@stylistic/indent': 'off',
      'vue/comma-dangle': ['error', 'never'],
      'vue/html-closing-bracket-newline': [
        'error',
        {
          singleline: 'never',
          multiline: 'never'
        }
      ],
      'vue/padding-line-between-tags': ['error', [
        { blankLine: 'always', prev: '*', next: '*' }
      ]],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 1,
          multiline: 1
        }
      ],
      'vue/html-indent': [
        'error',
        2,
        {
          attribute: 1,
          baseIndent: 1,
          closeBracket: 0,
          alignAttributesVertically: false
        }
      ],
      'vue/script-indent': ['error', 2, {
        baseIndent: 0,
        switchCase: 1,
        ignores: []
      }],
      'vue/block-order': [
        'error',
        {
          order: [['script', 'template'], 'style']
        }
      ]
    }
  }
)
