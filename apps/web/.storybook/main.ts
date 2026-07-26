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
}

export default config
