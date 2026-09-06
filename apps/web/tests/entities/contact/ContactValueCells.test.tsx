import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import {
  ContactRelativeCell,
  ContactStatusCell,
} from '@/entities/contact/ui/cells/ContactValueCells'

const CONTACT = CONTACTS_FIXTURE[0]!

describe('ContactStatusCell', () => {
  it('falls back to the raw status key when the taxonomy has no match', () => {
    render(<ContactStatusCell contact={CONTACT} options={[]} locale="es-CO" />, { wrapper })

    expect(screen.getByText(CONTACT.status)).toBeInTheDocument()
  })

  it('prefers the taxonomy label', () => {
    render(
      <ContactStatusCell
        contact={CONTACT}
        options={[]}
        locale="es-CO"
        choice={{ key: CONTACT.status, label: 'Calificado', color: '#a5e96f' }}
      />,
      { wrapper },
    )

    expect(screen.getByText('Calificado')).toBeInTheDocument()
  })
})

describe('ContactRelativeCell', () => {
  it('falls back to a dash without a date', () => {
    render(<ContactRelativeCell iso={null} locale="es-CO" staleLabel="Sin contacto" />, { wrapper })

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('reads recency as elapsed time and reveals the exact moment on hover', async () => {
    const when = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    render(<ContactRelativeCell iso={when} locale="es-CO" staleLabel="Sin contacto" />, { wrapper })

    await userEvent.hover(screen.getByText('hace 2 horas'))

    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
  })
})
