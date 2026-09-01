import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { OptionRow } from '@/shared/ui/organisms/data-table/quick-filters/ui/option-row'
import { Command, CommandList } from '@/shared/ui/shadcn/command'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

Element.prototype.scrollIntoView = vi.fn()

function setup(hint?: string) {
  render(
    <TooltipProvider delayDuration={0}>
      <Command>
        <CommandList>
          <OptionRow
            option={{ value: 'web', label: 'Web', hint }}
            checked={false}
            onToggle={vi.fn()}
          />
        </CommandList>
      </Command>
    </TooltipProvider>,
  )
}

describe('OptionRow', () => {
  it('shows the option hint as a tooltip on hover', async () => {
    const user = userEvent.setup()
    setup('Contactos que llegaron desde el sitio web')

    await user.hover(screen.getByText('Web'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Contactos que llegaron desde el sitio web',
    )
  })

  it('renders no tooltip wiring when the option has no hint', async () => {
    const user = userEvent.setup()
    setup()

    await user.hover(screen.getByText('Web'))

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
