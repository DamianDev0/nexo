import { expect, fn, userEvent, within } from 'storybook/test'

import { TrayIcon } from '@/shared/ui/icons'

import { PillButton } from '../atoms/pill-button'

import { EmptyState } from './empty-state'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Organisms/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

const onPrimary = fn()

export const Default: Story = {
  args: {
    icon: <TrayIcon className="size-5" />,
    title: 'No deals yet',
    description: 'Create your first deal or import a spreadsheet — Nexo maps the columns for you.',
    children: null,
  },
  render: (args) => (
    <EmptyState {...args} className="w-xl">
      <div className="flex gap-2.5">
        <PillButton size="md" onClick={onPrimary}>
          New deal
        </PillButton>
        <PillButton size="md" variant="tertiary">
          Import CSV
        </PillButton>
      </div>
    </EmptyState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'New deal' }))
    await expect(onPrimary).toHaveBeenCalledOnce()
  },
}

export const NoActions: Story = {
  args: {
    title: 'No results',
    description: 'Try a different search or clear the filters.',
  },
}

export const WorstCase: Story = {
  args: {
    icon: <TrayIcon className="size-5" />,
    title: 'No contacts match the extremely specific saved filter you built',
    description:
      'The combination of city, lead status, lifecycle stage, owner and last-activity window returned nothing. Loosen one condition and try again.',
    children: null,
  },
  render: (args) => (
    <EmptyState {...args} className="w-xl">
      <PillButton size="md">Clear filters</PillButton>
    </EmptyState>
  ),
}
