import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactView } from '@repo/shared-types'

import { useViewTabMenu, ViewTabDialogs } from '@/features/manage-contact-views'

const update = vi.fn()
const remove = vi.fn()

vi.mock('@/features/manage-contact-views/query/useContactViewsAdmin', () => ({
  useContactViewsAdmin: () => ({
    create: vi.fn(),
    update: (input: unknown) => update(input),
    remove: (id: string) => remove(id),
    isPending: false,
  }),
}))

vi.mock('@/shared/ui/ruixen/slide-to-delete-button', () => ({
  default: ({ label, onConfirm }: { label: string; onConfirm?: () => void }) => (
    <button type="button" onClick={onConfirm}>
      {label}
    </button>
  ),
}))

const VIEW = {
  id: 'v1',
  name: 'Clientes VIP',
  description: 'Los importantes',
} as ContactView

function Host() {
  const menu = useViewTabMenu([VIEW])
  const actions = menu.itemMenu({ id: 'view:v1', label: VIEW.name })
  const none = menu.itemMenu({ id: 'new', label: 'New' })
  return (
    <>
      <span data-testid="plain-count">{none.length}</span>
      {actions.map((action) => (
        <button key={action.key} onClick={action.onSelect}>
          {action.key}
        </button>
      ))}
      <ViewTabDialogs menu={menu} />
    </>
  )
}

describe('useViewTabMenu + ViewTabDialogs', () => {
  beforeEach(() => {
    update.mockClear()
    remove.mockClear()
  })

  it('offers no actions for non-view tabs', () => {
    render(<Host />, { wrapper })
    expect(screen.getByTestId('plain-count')).toHaveTextContent('0')
  })

  it('deletes the targeted view on slide confirm', async () => {
    const user = userEvent.setup()
    render(<Host />, { wrapper })

    await user.click(screen.getByRole('button', { name: 'delete' }))
    await user.click(screen.getByRole('button', { name: 'contacts.views.slideToDelete' }))

    expect(remove).toHaveBeenCalledWith('v1')
  })

  it('edits only name and description, never the view filters', async () => {
    const user = userEvent.setup()
    render(<Host />, { wrapper })

    await user.click(screen.getByRole('button', { name: 'edit' }))
    const name = screen.getByDisplayValue('Clientes VIP')
    await user.clear(name)
    await user.type(name, 'Clientes oro')
    await user.click(screen.getByRole('button', { name: 'common.save' }))

    expect(update).toHaveBeenCalledWith({
      id: 'v1',
      data: { name: 'Clientes oro', description: 'Los importantes' },
    })
  })

  it('closing without confirming never mutates', async () => {
    const user = userEvent.setup()
    render(<Host />, { wrapper })

    await user.click(screen.getByRole('button', { name: 'delete' }))
    await user.click(screen.getByRole('button', { name: 'common.cancel' }))

    expect(remove).not.toHaveBeenCalled()
  })
})
