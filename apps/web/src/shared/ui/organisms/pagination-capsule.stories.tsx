import { expect, fn, userEvent, within } from 'storybook/test'

import { PaginationCapsule } from './pagination-capsule'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Organisms/PaginationCapsule',
  component: PaginationCapsule,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PaginationCapsule>

export default meta
type Story = StoryObj<typeof meta>

const onPageChange = fn()
const onSizeChange = fn()
const onJumpEnd = fn()

export const Default: Story = {
  args: { children: null },
  render: () => (
    <PaginationCapsule>
      <PaginationCapsule.Nav page={1} totalPages={112} onPageChange={onPageChange} />
      <PaginationCapsule.Divider />
      <PaginationCapsule.PageSize value={25} options={[10, 25, 50, 100]} onChange={onSizeChange} />
      <PaginationCapsule.Divider />
      <PaginationCapsule.Progress value={38} />
      <PaginationCapsule.Divider />
      <PaginationCapsule.JumpEnd onClick={onJumpEnd} />
    </PaginationCapsule>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await expect(onPageChange).toHaveBeenCalledWith(2)
    await userEvent.click(canvas.getByRole('button', { name: 'Last page' }))
    await expect(onJumpEnd).toHaveBeenCalledOnce()
  },
}

export const NavOnly: Story = {
  args: { children: null },
  render: () => (
    <PaginationCapsule>
      <PaginationCapsule.Nav page={4} totalPages={7} onPageChange={onPageChange} />
    </PaginationCapsule>
  ),
}

export const FirstAndLastDisabled: Story = {
  args: { children: null },
  render: () => (
    <PaginationCapsule>
      <PaginationCapsule.Nav page={1} totalPages={1} onPageChange={onPageChange} />
    </PaginationCapsule>
  ),
}

export const WorstCase: Story = {
  args: { children: null },
  render: () => (
    <PaginationCapsule>
      <PaginationCapsule.Nav page={99_999} totalPages={999_999} onPageChange={onPageChange} />
      <PaginationCapsule.Divider />
      <PaginationCapsule.PageSize value={100} options={[10, 25, 50, 100]} onChange={onSizeChange} />
      <PaginationCapsule.Divider />
      <PaginationCapsule.Progress value={100} />
      <PaginationCapsule.Divider />
      <PaginationCapsule.JumpEnd onClick={onJumpEnd} />
    </PaginationCapsule>
  ),
}
