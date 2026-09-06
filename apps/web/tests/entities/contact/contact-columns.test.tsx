import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE, CONTACT_COLUMNS_FIXTURE } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactListItem } from '@repo/shared-types'

import { buildContactColumns } from '@/entities/contact/ui/columns/contact-columns'

const CONTEXT = {
  t: ((key: string) => key) as never,
  locale: 'es-CO',
  taxonomy: {
    statusByKey: new Map(),
    sourceByKey: new Map(),
    lifecycleByKey: new Map(),
  },
}

function columnsFor() {
  return buildContactColumns(CONTACT_COLUMNS_FIXTURE, CONTEXT)
}

function CellUnderTest({
  contact,
  columnId,
}: Readonly<{ contact: ContactListItem; columnId: string }>) {
  const table = useReactTable({
    data: [contact],
    columns: [...columnsFor()],
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })
  const row = table.getRowModel().rows[0]!
  const cell = row.getVisibleCells().find((candidate) => candidate.column.id === columnId)!
  return <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
}

describe('buildContactColumns', () => {
  it('does not ship an actions column — row actions live in the hover rail', () => {
    expect(columnsFor().some((column) => column.id === 'actions')).toBe(false)
  })

  it('pins the identity columns by making name lockable', () => {
    const name = columnsFor().find((column) => column.id === 'name')!

    expect(name.meta?.lockable).toBe(true)
    expect(name.meta?.grow).toBe(true)
  })

  it('gives every data column a description hint', () => {
    const described = columnsFor().filter((column) => column.id !== 'select')

    expect(described.length).toBeGreaterThan(0)
    for (const column of described) {
      expect(column.meta?.description).toBe(`contacts.columnHints.${column.id}`)
    }
  })

  it('falls back to the WhatsApp number when the phone is missing', () => {
    const contact = { ...CONTACTS_FIXTURE[0]!, phone: null, whatsapp: '3001234567' }

    render(<CellUnderTest contact={contact} columnId="phone" />, { wrapper })
    expect(screen.getByText('+57 300 123 4567')).toBeInTheDocument()

    render(<CellUnderTest contact={contact} columnId="whatsapp" />, { wrapper })
    expect(screen.getAllByText('+57 300 123 4567')).toHaveLength(2)
  })

  it('formats the created date as DD/MM/YYYY with the Bogota time below', () => {
    const contact = { ...CONTACTS_FIXTURE[0]!, createdAt: '2026-08-14T15:00:00.000Z' }

    render(<CellUnderTest contact={contact} columnId="createdAt" />, { wrapper })

    expect(screen.getByText('14/08/2026')).toBeInTheDocument()
    expect(screen.getByText(/10:00/)).toBeInTheDocument()
  })
})
