import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

import { SplitButton } from '@/shared/ui/molecules/split-button'

describe('SplitButton', () => {
  it('renders a single plain button when there are no secondary actions', () => {
    render(<SplitButton label="Create contact" onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Create contact' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'common.moreOptions' })).not.toBeInTheDocument()
  })

  it('runs the primary action without opening the menu', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <SplitButton
        label="Create contact"
        onClick={onClick}
        actions={[{ label: 'Create and add another', onSelect: vi.fn() }]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Create contact' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('opens the menu from the caret and runs the chosen action', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <SplitButton
        label="Create contact"
        onClick={vi.fn()}
        actions={[{ label: 'Create and add another', onSelect }]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'common.moreOptions' }))

    const item = await screen.findByRole('menuitem', { name: 'Create and add another' })
    await user.click(item)

    expect(onSelect).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menuitem')).not.toBeInTheDocument())
  })

  it('sizes the menu to its content instead of the popover default width', async () => {
    const user = userEvent.setup()
    render(
      <SplitButton
        label="Create contact"
        onClick={vi.fn()}
        actions={[{ label: 'Create and add another', onSelect: vi.fn() }]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'common.moreOptions' }))

    const menu = (await screen.findByRole('menuitem')).closest('[data-slot="popover-content"]')
    expect(menu).toHaveClass('w-auto', 'min-w-40')
    expect(menu).not.toHaveClass('w-72')
  })
})
