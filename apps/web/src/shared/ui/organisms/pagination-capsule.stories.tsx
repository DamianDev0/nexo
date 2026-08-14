import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

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

export const Default: Story = {
  args: { children: null, label: 'Pagination', collapseLabel: 'Collapse pagination' },
  render: () => (
    <PaginationCapsule label="Pagination" collapseLabel="Collapse pagination">
      <PaginationCapsule.Nav
        page={1}
        totalPages={112}
        onPageChange={onPageChange}
        labels={{ prev: 'Previous page', next: 'Next page' }}
      />
      <PaginationCapsule.Divider />
      <PaginationCapsule.PageSize
        value={25}
        options={[10, 25, 50, 100]}
        onChange={onSizeChange}
        label="Rows per page"
      />
    </PaginationCapsule>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await expect(onPageChange).toHaveBeenCalledWith(2)
    const collapse = canvas.getByRole('button', { name: 'Collapse pagination' })
    await expect(collapse).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(collapse)
    await expect(collapse).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() =>
      expect(canvas.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument(),
    )

    await userEvent.click(collapse)
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Next page' })).toBeInTheDocument(),
    )
  },
}

export const NavOnly: Story = {
  args: { children: null, label: 'Pagination', collapseLabel: 'Collapse pagination' },
  render: () => (
    <PaginationCapsule label="Pagination" collapseLabel="Collapse pagination">
      <PaginationCapsule.Nav
        page={4}
        totalPages={7}
        onPageChange={onPageChange}
        labels={{ prev: 'Previous page', next: 'Next page' }}
      />
    </PaginationCapsule>
  ),
}

export const FirstAndLastDisabled: Story = {
  args: { children: null, label: 'Pagination', collapseLabel: 'Collapse pagination' },
  render: () => (
    <PaginationCapsule label="Pagination" collapseLabel="Collapse pagination">
      <PaginationCapsule.Nav
        page={1}
        totalPages={1}
        onPageChange={onPageChange}
        labels={{ prev: 'Previous page', next: 'Next page' }}
      />
    </PaginationCapsule>
  ),
}

export const WorstCase: Story = {
  args: { children: null, label: 'Pagination', collapseLabel: 'Collapse pagination' },
  render: () => (
    <PaginationCapsule label="Pagination" collapseLabel="Collapse pagination">
      <PaginationCapsule.Nav
        page={99_999}
        totalPages={999_999}
        onPageChange={onPageChange}
        labels={{ prev: 'Previous page', next: 'Next page' }}
      />
      <PaginationCapsule.Divider />
      <PaginationCapsule.PageSize
        value={100}
        options={[10, 25, 50, 100]}
        onChange={onSizeChange}
        label="Rows per page"
      />
    </PaginationCapsule>
  ),
}
