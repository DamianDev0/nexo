import { BadgeSoft } from './badge-soft'
import { BADGE_SOFT_FIXTURES } from './badge-soft.fixtures'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Atoms/BadgeSoft',
  component: BadgeSoft,
  parameters: { layout: 'centered' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'info', 'warning', 'positive', 'negative', 'outline'],
    },
  },
} satisfies Meta<typeof BadgeSoft>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Open' },
}

export const AllTones: Story = {
  args: { children: 'Open' },
  render: () => (
    <div className="flex flex-wrap items-center gap-2.5">
      {BADGE_SOFT_FIXTURES.map((badge) => (
        <BadgeSoft key={badge.label} tone={badge.tone}>
          {badge.label}
        </BadgeSoft>
      ))}
    </div>
  ),
}

export const WorstCase: Story = {
  args: { children: 'At risk' },
  render: () => (
    <div className="flex max-w-64 flex-wrap items-center gap-2.5">
      <BadgeSoft tone="warning">At risk</BadgeSoft>
      <BadgeSoft tone="positive">Signature pending approval</BadgeSoft>
      <BadgeSoft tone="outline">Barrancabermeja Distribuciones S.A.S.</BadgeSoft>
    </div>
  ),
}

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { tone: 'positive', children: 'Won' },
}
