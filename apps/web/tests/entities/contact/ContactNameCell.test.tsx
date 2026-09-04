import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { ContactNameCell } from '@/entities/contact/ui/cells/ContactNameCell'

const CONTACT = CONTACTS_FIXTURE[0]!
const FULL_NAME = `${CONTACT.firstName} ${CONTACT.lastName}`

const LABELS = {
  preview: 'Vista rápida',
  addNote: 'Agregar nota',
  editTags: 'Editar etiquetas',
  tags: {
    title: 'Etiquetas',
    count: (total: number) => `${total} etiquetas`,
  },
  notes: { title: 'Notas' },
}

describe('ContactNameCell', () => {
  it('shows the full name as plain text without actions', () => {
    render(<ContactNameCell contact={CONTACT} />, { wrapper })

    expect(screen.getByText(FULL_NAME)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('opens the contact when the name is clicked', async () => {
    const onOpen = vi.fn()
    render(<ContactNameCell contact={CONTACT} labels={LABELS} actions={{ onOpen }} />, { wrapper })

    await userEvent.click(screen.getByRole('button', { name: FULL_NAME }))

    expect(onOpen).toHaveBeenCalledWith(CONTACT)
  })

  it('keeps a persistent preview action in the strip', async () => {
    const onPreview = vi.fn()
    render(<ContactNameCell contact={CONTACT} labels={LABELS} actions={{ onPreview }} />, {
      wrapper,
    })

    await userEvent.click(screen.getByRole('button', { name: 'Vista rápida' }))

    expect(onPreview).toHaveBeenCalledWith(CONTACT)
  })

  it('shows the tag count and reveals the list on hover', async () => {
    const contact = { ...CONTACT, tags: ['vip', 'frio', 'norte'] }
    render(<ContactNameCell contact={contact} labels={LABELS} actions={{}} />, { wrapper })

    expect(screen.getByText('3')).toBeInTheDocument()

    await userEvent.hover(screen.getByRole('button', { name: 'Etiquetas' }))

    expect(await screen.findByText('norte')).toBeInTheDocument()
  })

  it('hides the tags action when the contact has no tags', () => {
    const onPreview = vi.fn()
    const contact = { ...CONTACT, tags: [] }
    render(<ContactNameCell contact={contact} labels={LABELS} actions={{ onPreview }} />, {
      wrapper,
    })

    expect(screen.queryByRole('button', { name: 'Etiquetas' })).not.toBeInTheDocument()
  })
})
