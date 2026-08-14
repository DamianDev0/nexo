import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import type { TFunction } from 'i18next'

import {
  ContactNameCell,
  ContactRowActions,
  ContactTagsCell,
  MAX_VISIBLE_TAGS,
} from '@/features/manage-contacts/lib/contact-cells'

const t = ((key: string) => key) as unknown as TFunction

const CONTACT = CONTACTS_FIXTURE[0]!

describe('ContactNameCell', () => {
  it('shows the full name with the email underneath', () => {
    render(<ContactNameCell contact={CONTACT} />)

    expect(screen.getByText(`${CONTACT.firstName} ${CONTACT.lastName}`)).toBeInTheDocument()
    expect(screen.getByText(CONTACT.email ?? '')).toBeInTheDocument()
  })

  it('omits the subtitle when the contact has no email', () => {
    render(<ContactNameCell contact={{ ...CONTACT, email: null }} />)

    expect(screen.queryByText(CONTACT.email ?? '')).not.toBeInTheDocument()
  })
})

describe('ContactTagsCell', () => {
  it('falls back to a dash when there are no tags', () => {
    render(<ContactTagsCell tags={[]} />)

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders every tag while they fit', () => {
    render(<ContactTagsCell tags={['vip', 'frio']} />)

    expect(screen.getByText('vip')).toBeInTheDocument()
    expect(screen.getByText('frio')).toBeInTheDocument()
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it('counts the overflow instead of overflowing the cell', () => {
    render(<ContactTagsCell tags={['a', 'b', 'c', 'd', 'e']} />)

    expect(screen.getAllByText(/^[a-e]$/)).toHaveLength(MAX_VISIBLE_TAGS)
    expect(screen.getByText('+3')).toBeInTheDocument()
  })
})

describe('ContactRowActions', () => {
  it('runs edit and archive from the row menu', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onArchive = vi.fn()
    render(<ContactRowActions t={t} onEdit={onEdit} onArchive={onArchive} />)

    await user.click(screen.getByRole('button', { name: 'contacts.actions.open' }))
    await user.click(await screen.findByRole('menuitem', { name: 'contacts.actions.edit' }))
    expect(onEdit).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'contacts.actions.open' }))
    await user.click(await screen.findByRole('menuitem', { name: 'contacts.actions.archive' }))
    expect(onArchive).toHaveBeenCalledTimes(1)
  })
})
