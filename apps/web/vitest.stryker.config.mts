import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const here = fileURLToPath(new URL('.', import.meta.url))
const realAppDir = here.replace(/\.stryker-tmp\/sandbox-[^/]+\/?$/, '')
const monorepoRoot = join(realAppDir, '../..')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': join(here, 'src'),
      '@repo/shared-utils': join(monorepoRoot, 'packages/shared-utils/src/index.ts'),
      '@repo/shared-types': join(monorepoRoot, 'packages/shared-types/src/index.ts'),
    },
  },
  test: {
    dir: 'tests',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/ssr-coverage.test.ts'],
    environment: 'jsdom',
    globals: true,
    env: { NEXT_PUBLIC_API_URL: 'http://localhost:8080/api/v1' },
    setupFiles: ['./tests/setup.ts'],
  },
})
