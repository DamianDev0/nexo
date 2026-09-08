import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ContactCellSaving } from '@/entities/contact/ui/cells/ContactCellSaving'

describe('ContactCellSaving', () => {
  it('renders children untouched when idle', () => {
    render(
      <ContactCellSaving saving={false} label="Guardando">
        <span>valor</span>
      </ContactCellSaving>,
    )
    expect(screen.getByText('valor')).toBeInTheDocument()
    expect(screen.queryByLabelText('Guardando')).not.toBeInTheDocument()
  })

  it('marks the cell busy and shows the spinner while saving', () => {
    render(
      <ContactCellSaving saving label="Guardando">
        <span>valor</span>
      </ContactCellSaving>,
    )
    expect(screen.getByText('valor').parentElement).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText('Guardando')).toBeInTheDocument()
  })
})
