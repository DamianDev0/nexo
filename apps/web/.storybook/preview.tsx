import '../src/styles/globals.css'

import { withNexoTheme } from './theme-decorator'

import type { Preview } from '@storybook/nextjs-vite'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'error' },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'Nexo theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark', 'side-by-side'],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Density',
      toolbar: {
        title: 'Density',
        icon: 'grow',
        items: ['comfortable', 'compact'],
        dynamicTitle: true,
      },
    },
    tenant: {
      description: 'White-label tenant preset',
      toolbar: {
        title: 'Tenant',
        icon: 'paintbrush',
        items: ['nexo', 'ochre', 'indigo'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    density: 'comfortable',
    tenant: 'nexo',
  },
  decorators: [withNexoTheme],
}

export default preview
