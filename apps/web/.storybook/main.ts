import { fileURLToPath } from 'node:url'

import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  framework: '@storybook/nextjs-vite',
  stories: [
    '../src/shared/ui/**/*.stories.@(ts|tsx)',
    '../src/entities/**/*.stories.@(ts|tsx)',
    '../src/features/**/*.stories.@(ts|tsx)',
    '../src/widgets/**/*.stories.@(ts|tsx)',
    '../src/docs/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-themes',
  ],
  staticDirs: ['../public'],
  viteFinal: (config) => {
    config.resolve ??= {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@repo/shared-utils': fileURLToPath(
        new URL('../../../packages/shared-utils/src/index.ts', import.meta.url),
      ),
      '@repo/shared-types': fileURLToPath(
        new URL('../../../packages/shared-types/src/index.ts', import.meta.url),
      ),
    }
    return config
  },
}

export default config
