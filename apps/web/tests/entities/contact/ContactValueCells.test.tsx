import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import {
  ContactRelativeCell,
  ContactScoreCell,
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

describe('ContactScoreCell', () => {
  it('leaves a score of zero as an empty marker', () => {
    render(<ContactScoreCell score={0} bandLabel="Puntaje bajo" />, { wrapper })

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows the score as a plain number with a semantic dot', () => {
    render(<ContactScoreCell score={82} bandLabel="Puntaje alto" />, { wrapper })

    expect(screen.getByText('82')).toBeInTheDocument()
  })

  it('explains the band in a tooltip on hover', async () => {
    render(<ContactScoreCell score={99} bandLabel="Puntaje 99 — alto interés" />, { wrapper })

    await userEvent.hover(screen.getByText('99'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Puntaje 99 — alto interés')
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
