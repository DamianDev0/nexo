import { nestJsConfig } from '@repo/eslint-config/nest-js'

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nestJsConfig,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/*.config.mjs',
      '**/*.config.js',
      '.prettierrc.mjs',
    ],
  },
]
