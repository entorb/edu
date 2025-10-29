import globals from 'globals'
import pluginCypress from 'eslint-plugin-cypress'
import pluginVitest from 'eslint-plugin-vitest'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  // Global ignores
  {
    ignores: ['**/*.d.ts', '**/.vite/', 'coverage', 'dist', 'node_modules', 'public']
  },

  // Base TypeScript files
  {
    files: ['**/*.{ts,mts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'prefer-template': 'warn'
    }
  },

  // Vue files - use spread syntax to properly apply Vue configs
  ...pluginVue.configs['flat/essential'],
  ...pluginVue.configs['flat/strongly-recommended'],

  // Vue files with TypeScript support and custom rules
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue'],
        parser: tsParser,
        sourceType: 'module'
      },
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots']
        }
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ],
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: ['default', 'index', 'App', 'Flashcard', 'Scoreboard']
        }
      ],
      'vue/no-ref-object-reactivity-loss': 'error',
      'vue/no-unused-refs': 'warn',
      'vue/no-unused-vars': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-v-html': 'error',
      'vue/no-v-text-v-html-on-component': 'error',
      'vue/padding-line-between-blocks': 'warn',
      'vue/prefer-separate-static-class': 'warn',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/require-default-prop': 'warn',
      'vue/v-for-delimiter-style': ['error', 'in'],
      'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }]
    }
  },

  // Generated TypeScript files - relax rules
  {
    files: [
      '**/auto-imports.d.ts',
      '**/components.d.ts',
      '**/env.d.ts',
      '**/typed-router.d.ts',
      'vite.config.d.ts',
      'vitest.config.d.ts'
    ],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },

  // Config files
  {
    files: ['*.config.{js,ts,mjs,mts}', 'vite.config.*', 'vitest.config.*'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  },

  // Vitest test files
  {
    files: [
      '**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/setup.ts',
      'src/**/__tests__/**/*.{js,ts,jsx,tsx}'
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        // Add Vitest globals if using globals: true in vitest.config
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        suite: 'readonly',
        test: 'readonly',
        vi: 'readonly'
      }
    },
    plugins: {
      vitest: pluginVitest
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
      'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
      'vitest/expect-expect': 'warn',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-focused-tests': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/valid-expect': 'error'
    }
  },

  // Cypress files
  {
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        cy: 'readonly',
        Cypress: 'readonly'
      }
    },
    plugins: {
      cypress: pluginCypress
    },
    rules: {
      ...pluginCypress.configs.recommended.rules,
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-console': 'off',
      'no-unused-expressions': 'off'
    }
  },

  // Apply skip formatting last (removes conflicting formatting rules)
  skipFormatting
]
