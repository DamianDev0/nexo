import { AvatarSquircle } from './avatar-squircle'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Atoms/AvatarSquircle',
  component: AvatarSquircle,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'inline-radio', options: ['table', 'kanban'] },
    tone: { control: 'inline-radio', options: ['lime', 'warning', 'info', 'neutral'] },
  },
} satisfies Meta<typeof AvatarSquircle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { initials: 'CR' },
}

export const Tones: Story = {
  args: { initials: 'CR' },
  render: () => (
    <div className="flex items-center gap-3">
      <AvatarSquircle initials="CR" tone="lime" />
      <AvatarSquircle initials="JD" tone="warning" />
      <AvatarSquircle initials="MP" tone="info" />
      <AvatarSquircle initials="RQ" tone="neutral" />
    </div>
  ),
}

export const Kanban: Story = {
  args: { initials: 'CR', size: 'kanban' },
}

export const WorstCase: Story = {
  args: { initials: 'Ñ' },
}

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { initials: 'CR', size: 'table', tone: 'lime' },
}
