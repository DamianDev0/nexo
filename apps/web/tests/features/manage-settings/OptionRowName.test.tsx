import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { OptionRowName } from '@/features/manage-settings/ui/sections/contacts/OptionRowName'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

function renderName(name: string, description: string | null) {
  return render(
    <TooltipProvider delayDuration={0}>
      <OptionRowName name={name} description={description} />
    </TooltipProvider>,
  )
}

describe('OptionRowName', () => {
  it('renders the name as inert text when there is no description', () => {
    renderName('Nuevo', null)

    expect(screen.getByText('Nuevo')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('exposes the name as a focusable trigger when a description exists', () => {
    renderName('Dormido', 'Sin contacto hace 90 dias')

    const trigger = screen.getByRole('button', { name: 'Dormido' })
    expect(trigger).toHaveClass('cursor-help', 'truncate', 'max-w-full')
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })

  it('opens the description on hover', async () => {
    const user = userEvent.setup()
    renderName('Dormido', 'Sin contacto hace 90 dias')
    const trigger = screen.getByRole('button', { name: 'Dormido' })

    await user.hover(trigger)

    await waitFor(() => expect(trigger).toHaveAttribute('data-state', 'delayed-open'))

    const hint = screen.getAllByText('Sin contacto hace 90 dias').at(-1)
    expect(hint).toHaveClass('line-clamp-5')
    expect(hint?.closest('[data-slot="tooltip-content"]')).toHaveAttribute('data-side', 'top')
  })

  it('opens the description on keyboard focus', async () => {
    const user = userEvent.setup()
    renderName('Dormido', 'Sin contacto hace 90 dias')
    const trigger = screen.getByRole('button', { name: 'Dormido' })

    await user.tab()

    expect(trigger).toHaveFocus()
    await waitFor(() => expect(trigger).toHaveAttribute('data-state', 'instant-open'))
  })

  it('never renders a tooltip for an empty description', () => {
    renderName('Nuevo', '')

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
