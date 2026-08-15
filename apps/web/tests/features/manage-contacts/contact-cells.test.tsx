import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import {
  ContactNameCell,
  ContactStatusCell,
  ContactTagsCell,
} from '@/features/manage-contacts/lib/contact-cells'

const CONTACT = CONTACTS_FIXTURE[0]!

const tagLabel = (count: number) => `${count} etiquetas`

describe('ContactNameCell', () => {
  it('shows the full name', () => {
    render(<ContactNameCell contact={CONTACT} />, { wrapper })

    expect(screen.getByText(`${CONTACT.firstName} ${CONTACT.lastName}`)).toBeInTheDocument()
  })
})

describe('ContactStatusCell', () => {
  it('falls back to the raw status key when the taxonomy has no match', () => {
    render(<ContactStatusCell status={CONTACT.status} />, { wrapper })

    expect(screen.getByText(CONTACT.status)).toBeInTheDocument()
  })

  it('prefers the taxonomy label', () => {
    render(
      <ContactStatusCell
        status={CONTACT.status}
        choice={{ key: CONTACT.status, label: 'Calificado', color: '#a5e96f' }}
      />,
      { wrapper },
    )

    expect(screen.getByText('Calificado')).toBeInTheDocument()
  })
})

describe('ContactTagsCell', () => {
  it('falls back to a dash when there are no tags', () => {
    render(<ContactTagsCell tags={[]} label={tagLabel} />, { wrapper })

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('names the tag outright when there is only one', () => {
    render(<ContactTagsCell tags={['vip']} label={tagLabel} />, { wrapper })

    expect(screen.getByText('vip')).toBeInTheDocument()
  })

  it('collapses two or more tags into a single count badge', () => {
    render(<ContactTagsCell tags={['vip', 'frio']} label={tagLabel} />, { wrapper })

    expect(screen.getByText('2 etiquetas')).toBeInTheDocument()
    expect(screen.queryByText('vip')).not.toBeInTheDocument()
    expect(screen.queryByText('frio')).not.toBeInTheDocument()
  })

  it('reveals every collapsed tag on hover', async () => {
    render(<ContactTagsCell tags={['a', 'b', 'c']} label={tagLabel} />, { wrapper })

    await userEvent.hover(screen.getByText('3 etiquetas'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('a · b · c')
  })
})
