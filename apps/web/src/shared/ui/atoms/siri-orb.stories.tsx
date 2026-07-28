import { SiriOrb } from './siri-orb'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Brand/SiriOrb',
  component: SiriOrb,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SiriOrb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = {
  args: { size: 96 },
}

export const Slow: Story = {
  args: { animationDuration: 40 },
}

export const WorstCase: Story = {
  parameters: {
    chromatic: { prefersReducedMotion: 'reduce' },
  },
  render: () => (
    <div className="motion-reduce:[&_*]:animate-none">
      <SiriOrb />
    </div>
  ),
}

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { size: 192, animationDuration: 20 },
}
