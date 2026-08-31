import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import { ReassignOptionDialog } from '@/features/manage-settings/ui/sections/contacts/ReassignOptionDialog'


vi.mock('@/entities/nomenclature', () => ({
  useEntityTerms: () => ({ lowerSingular: 'contact', lowerPlural: 'contacts' }),
}))

const CANDIDATES = [
  { key: 'cold', label: 'Cold', color: '#84cc16' },
  { key: 'warm', label: 'Warm', color: '#f59e0b' },
]

const SOURCE = { label: 'VIP', count: 3 }

function renderDialog(confirm: { action: (toKey: string) => void; isPending: boolean }) {
  return render(
    <ReassignOptionDialog
      open
      onOpenChange={vi.fn()}
      source={SOURCE}
      candidates={CANDIDATES}
      confirm={confirm}
    />,
    { wrapper },
  )
}

describe('ReassignOptionDialog', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('disables confirm until a target is selected, then confirms once with its key', async () => {
    const user = userEvent.setup()
    const action = vi.fn()
    renderDialog({ action, isPending: false })

    const confirmButton = screen.getByRole('button', { name: 'settings.reassign.confirm' })
    expect(confirmButton).toBeDisabled()

    await user.click(screen.getByText('settings.reassign.target'))
    await user.click(await screen.findByText('Cold'))
    await user.click(confirmButton)

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith('cold')
  })

  it('blocks a second confirm while the reassignment is pending', async () => {
    const user = userEvent.setup()
    const action = vi.fn()
    const view = renderDialog({ action, isPending: false })

    await user.click(screen.getByText('settings.reassign.target'))
    await user.click(await screen.findByText('Warm'))
    await user.click(screen.getByRole('button', { name: 'settings.reassign.confirm' }))
    expect(action).toHaveBeenCalledTimes(1)

    view.rerender(
      <ReassignOptionDialog
        open
        onOpenChange={vi.fn()}
        source={SOURCE}
        candidates={CANDIDATES}
        confirm={{ action, isPending: true }}
      />,
    )

    const confirmButton = screen.getByRole('button', { name: 'settings.reassign.confirm' })
    expect(confirmButton).toBeDisabled()
    await user.click(confirmButton)
    expect(action).toHaveBeenCalledTimes(1)
  })
})
