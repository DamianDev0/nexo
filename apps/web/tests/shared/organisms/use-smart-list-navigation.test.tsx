import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useSmartListNavigation } from '@/shared/ui/organisms/data-table/smart-list/model/use-smart-list-navigation'

const IDS = ['all', 'client', 'lost', 'new']

interface HarnessProps {
  readonly activeId: string
  readonly onSelect: (id: string) => void
}

function Harness({ activeId, onSelect }: HarnessProps) {
  const handleKeyDown = useSmartListNavigation(IDS, activeId, onSelect)

  return (
    <span role="tablist">
      {IDS.map((id) => (
        <span key={id} data-tab-id={id}>
          <button
            type="button"
            role="tab"
            aria-selected={id === activeId}
            tabIndex={id === activeId ? 0 : -1}
            onKeyDown={handleKeyDown}
          >
            {id}
          </button>
        </span>
      ))}
    </span>
  )
}

function setup(activeId: string) {
  const onSelect = vi.fn()
  render(<Harness activeId={activeId} onSelect={onSelect} />)
  return { onSelect, user: userEvent.setup() }
}

describe('useSmartListNavigation', () => {
  it('moves to the next tab on ArrowRight', async () => {
    const { onSelect, user } = setup('client')

    await user.click(screen.getByRole('tab', { name: 'client' }))
    await user.keyboard('{ArrowRight}')

    expect(onSelect).toHaveBeenLastCalledWith('lost')
  })

  it('moves to the previous tab on ArrowLeft', async () => {
    const { onSelect, user } = setup('lost')

    await user.click(screen.getByRole('tab', { name: 'lost' }))
    await user.keyboard('{ArrowLeft}')

    expect(onSelect).toHaveBeenLastCalledWith('client')
  })

  it('jumps to the first tab on Home and the last on End', async () => {
    const { onSelect, user } = setup('lost')

    await user.click(screen.getByRole('tab', { name: 'lost' }))
    await user.keyboard('{Home}')
    expect(onSelect).toHaveBeenLastCalledWith('all')

    await user.keyboard('{End}')
    expect(onSelect).toHaveBeenLastCalledWith('new')
  })

  it('stops at the edges instead of wrapping around', async () => {
    const { onSelect, user } = setup('new')

    await user.click(screen.getByRole('tab', { name: 'new' }))
    await user.keyboard('{ArrowRight}')

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('moves focus onto the tab it selects', async () => {
    const { user } = setup('client')

    await user.click(screen.getByRole('tab', { name: 'client' }))
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: 'lost' })).toHaveFocus()
  })

  it('ignores keys it does not own', async () => {
    const { onSelect, user } = setup('client')

    await user.click(screen.getByRole('tab', { name: 'client' }))
    await user.keyboard('{ArrowDown}a{Escape}')

    expect(onSelect).not.toHaveBeenCalled()
  })
})
