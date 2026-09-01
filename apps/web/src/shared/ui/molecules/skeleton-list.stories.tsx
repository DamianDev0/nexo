import { SkeletonList } from './skeleton-list'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Molecules/SkeletonList',
  component: SkeletonList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SkeletonList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { rows: 5, className: 'w-96' },
}

export const CompactRows: Story = {
  args: { rows: 3, rowClassName: 'h-8', className: 'w-96' },
}

export const WorstCase: Story = {
  args: { rows: 40, className: 'w-96' },
}
