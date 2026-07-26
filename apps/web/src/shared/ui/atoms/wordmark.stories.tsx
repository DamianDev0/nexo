import { Wordmark } from './wordmark'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Brand/Wordmark',
  component: Wordmark,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Wordmark>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
