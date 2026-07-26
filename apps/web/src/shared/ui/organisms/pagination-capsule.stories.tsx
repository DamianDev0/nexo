import { expect, fn, userEvent, within } from 'storybook/test'

import { PaginationCapsule } from './pagination-capsule'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Organisms/PaginationCapsule',
  component: PaginationCapsule,
  parameters: { layout: 'centered' },
  args: { onPageChange: fn() },
} satisfies Meta<typeof PaginationCapsule>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { data: { page: 4, totalPages: 7 } },
}

export const Numbered: Story = {
  args: { data: { page: 1, totalPages: 64, totalLabel: '1,284 contacts' } },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await expect(args.onPageChange).toHaveBeenCalledWith(2)
  },
}

export const FirstPage: Story = {
  args: { data: { page: 1, totalPages: 7 } },
}

export const WorstCase: Story = {
  args: { data: { page: 500, totalPages: 999, totalLabel: '128,412 deals' } },
}

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { data: { page: 3, totalPages: 12, totalLabel: '1,284 contacts' } },
}
