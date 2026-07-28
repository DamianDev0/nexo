import { MeshBloomOrb } from './mesh-bloom-orb'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Brand/MeshBloomOrb',
  component: MeshBloomOrb,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MeshBloomOrb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = {
  args: { size: 96 },
}

export const WorstCase: Story = {
  parameters: {
    chromatic: { prefersReducedMotion: 'reduce' },
  },
  render: () => (
    <div className="motion-reduce:[&_*]:animate-none">
      <MeshBloomOrb />
    </div>
  ),
}

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { size: 192 },
}
