import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import type { ContactListItem } from '@repo/shared-types'

import { buildContactColumns } from '@/features/manage-contacts/lib/contact-columns'

function ActionsCell({
  contact,
  onEdit,
  onArchive,
}: Readonly<{
  contact: ContactListItem
  onEdit: (contact: ContactListItem) => void
  onArchive: (contact: ContactListItem) => void
}>) {
  const columns = buildContactColumns(
    ((key: string) => key) as never,
    { onEdit, onArchive },
    new Map(),
  )
  const table = useReactTable({
    data: [contact],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })
  const row = table.getRowModel().rows[0]!
  const actionsCell = row.getVisibleCells().find((cell) => cell.column.id === 'actions')!
  return <>{flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}</>
}

describe('contact-columns actions cell', () => {
  it('calls onEdit with the row contact when Editar is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onArchive = vi.fn()
    const contact = CONTACTS_FIXTURE[0]!

    render(<ActionsCell contact={contact} onEdit={onEdit} onArchive={onArchive} />)

    await user.click(screen.getByRole('button', { name: 'contacts.actions.open' }))
    await user.click(await screen.findByText('contacts.actions.edit'))

    expect(onEdit).toHaveBeenCalledWith(contact)
    expect(onArchive).not.toHaveBeenCalled()
  })

  it('calls onArchive with the row contact when Archivar is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onArchive = vi.fn()
    const contact = CONTACTS_FIXTURE[1]!

    render(<ActionsCell contact={contact} onEdit={onEdit} onArchive={onArchive} />)

    await user.click(screen.getByRole('button', { name: 'contacts.actions.open' }))
    await user.click(await screen.findByText('contacts.actions.archive'))

    expect(onArchive).toHaveBeenCalledWith(contact)
    expect(onEdit).not.toHaveBeenCalled()
  })
})
