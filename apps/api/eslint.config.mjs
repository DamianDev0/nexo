import { nestJsConfig } from '@repo/eslint-config/nest-js'

/** @type {import("eslint").Linter.Config} */
export default [
  ...nestJsConfig,
  {
    ignores: ['.prettierrc.mjs', 'eslint.config.mjs'],
  },
  {
    // TypeORM QueryRunner.query() returns Promise<any> by design — no generic overload exists.
    // Service files type their results explicitly with typed interfaces; controllers that consume
    // those typed service values inherit the same any-bleed through TypeScript's inference chain.
    // no-unsafe-member-access is added for controllers where config objects are indexed by entity key.
    files: [
      '**/modules/**/*.service.ts',
      '**/modules/**/*.controller.ts',
      '**/modules/**/*.dto.ts',
      '**/shared/database/**/*.ts',
      '**/shared/integrations/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
