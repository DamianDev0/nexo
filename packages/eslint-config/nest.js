import globals from 'globals'
import { config as baseConfig } from './base.js'

/**
 * ESLint configuration for NestJS applications.
 * Enforces type safety, clean async patterns, and NestJS-specific best practices.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nestJsConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // ── Type safety ──────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // ── Async correctness ─────────────────────────────────────────────────
      // Never fire-and-forget promises — always await or void
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      // ── Code quality ──────────────────────────────────────────────────────
      // Underscore prefix = intentionally unused (_param, _var)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Prefer modern TS patterns
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // Use `import type` for type-only imports — cleaner tree-shaking
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // ── NestJS conventions ────────────────────────────────────────────────
      // No console.log — use the Pino logger (Logger from nestjs-pino)
      'no-console': 'warn',

      // Allow empty catch blocks with a comment (e.g., in cleanup code)
      'no-empty': ['error', { allowEmptyCatch: false }],

      // ── Disabled — not useful in NestJS ──────────────────────────────────
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/unbound-method': 'off', // decorators trigger this
    },
  },
]
