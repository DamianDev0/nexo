import { nextJsConfig } from '@repo/eslint-config/next-js'
import boundaries from 'eslint-plugin-boundaries'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
  {
    ignores: ['.next/**', 'next-env.d.ts', 'node_modules/**', 'storybook-static/**'],
  },
  ...nextJsConfig,
  {
    plugins: {
      'unused-imports': unusedImports,
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'react/prop-types': 'off',
      '@next/next/no-page-custom-font': 'off',
      'react/no-array-index-key': 'error',
      'react/display-name': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'views', pattern: 'src/views/**' },
        { type: 'widgets', pattern: 'src/widgets/**' },
        { type: 'features', pattern: 'src/features/**' },
        { type: 'entities', pattern: 'src/entities/**' },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true,
        },
        node: true,
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: [{ element: { type: 'app' } }],
              allow: [
                { element: { type: 'views' } },
                { element: { type: 'widgets' } },
                { element: { type: 'features' } },
                { element: { type: 'entities' } },
                { element: { type: 'shared' } },
                { element: { type: 'app' } },
              ],
            },
            {
              from: [{ element: { type: 'views' } }],
              allow: [
                { element: { type: 'widgets' } },
                { element: { type: 'features' } },
                { element: { type: 'entities' } },
                { element: { type: 'shared' } },
                { element: { type: 'views' } },
              ],
            },
            {
              from: [{ element: { type: 'widgets' } }],
              allow: [
                { element: { type: 'features' } },
                { element: { type: 'entities' } },
                { element: { type: 'shared' } },
                { element: { type: 'widgets' } },
              ],
            },
            {
              from: [{ element: { type: 'features' } }],
              allow: [
                { element: { type: 'entities' } },
                { element: { type: 'shared' } },
                { element: { type: 'features' } },
              ],
            },
            {
              from: [{ element: { type: 'entities' } }],
              allow: [{ element: { type: 'shared' } }, { element: { type: 'entities' } }],
            },
            { from: [{ element: { type: 'shared' } }], allow: [{ element: { type: 'shared' } }] },
          ],
        },
      ],
    },
  },
  {
    files: ['next.config.js'],
    languageOptions: {
      globals: { process: 'readonly' },
    },
  },
  {
    files: ['scripts/**'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly' },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/shared/ui/{shadcn,smoothui,kokonutui,ruixen,vuesax}/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-array-index-key': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  {
    files: ['src/shared/ui/vuesax/**/*.js'],
    languageOptions: {
      globals: {
        matchMedia: 'readonly',
        HTMLElement: 'readonly',
        customElements: 'readonly',
        document: 'readonly',
        innerWidth: 'readonly',
        innerHeight: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        addEventListener: 'readonly',
        removeEventListener: 'readonly',
        CustomEvent: 'readonly',
      },
    },
    rules: {
      'no-unused-private-class-members': 'off',
    },
  },
]
