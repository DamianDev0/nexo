'use client'

import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { AvatarSquircle } from '../../../atoms/avatar-squircle'
import { BadgeSoft } from '../../../atoms/badge-soft'
import { DataTable, selectionColumn, useDataTable } from '../index'

import {
  CONTACT_ROWS,
  SMART_LISTS,
  STATUS_TONE,
  WORST_ROW,
  manyRows,
  type ContactRow,
} from './data-table.fixtures'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ColumnDef } from '@tanstack/react-table'

const COLUMNS: ReadonlyArray<ColumnDef<ContactRow, unknown>> = [
  selectionColumn<ContactRow>({ all: 'Select all rows', row: 'Select row' }),
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    size: 240,
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <AvatarSquircle initials={row.original.initials} tone={row.original.tone} />
        <DataTable.RowTitle title={row.original.name} subtitle={row.original.role} />
      </span>
    ),
  },
  { id: 'company', accessorKey: 'company', header: 'Company', size: 200 },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Lead status',
    size: 130,
    cell: ({ row }) => {
      const status = STATUS_TONE[row.original.status]
      return <BadgeSoft tone={status.tone}>{status.label}</BadgeSoft>
    },
  },
  { id: 'email', accessorKey: 'email', header: 'Email', size: 220 },
  { id: 'city', accessorKey: 'city', header: 'City', size: 110 },
]

function ContactsTable({ rows }: Readonly<{ rows: ReadonlyArray<ContactRow> }>) {
  const instance = useDataTable({ data: rows, columns: COLUMNS, getRowId: (row) => row.id })
  const [search, setSearch] = useState('')
  const [activeList, setActiveList] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState(true)
  const selected = instance.table.getSelectedRowModel().rows.length
  const { pageIndex, pageSize } = instance.table.getState().pagination

  return (
    <DataTable instance={instance} className="min-w-4xl">
      <DataTable.SmartLists
        data={{ items: SMART_LISTS, activeId: activeList }}
        onSelect={setActiveList}
      />
      <DataTable.Toolbar>
        <DataTable.Search
          value={search}
          placeholder="Name, address, email, phone or ZIP"
          onChange={setSearch}
        />
        <DataTable.Filter label="City" active={false} onClick={() => undefined} />
        <DataTable.Filter
          label="Owner: Camila"
          active={ownerFilter}
          onClick={() => setOwnerFilter(true)}
          onClear={() => setOwnerFilter(false)}
        />
        <DataTable.EditColumns label="Edit columns" onClick={() => undefined} />
      </DataTable.Toolbar>
      {selected > 0 && (
        <DataTable.BulkBar label={`${selected} contacts selected`}>
          <DataTable.BulkAction>Assign owner</DataTable.BulkAction>
          <DataTable.BulkAction>Add to list</DataTable.BulkAction>
          <DataTable.BulkAction destructive>Delete</DataTable.BulkAction>
        </DataTable.BulkBar>
      )}
      <DataTable.Header />
      <DataTable.Body />
      <div className="flex justify-center py-5">
        <DataTable.Pagination label="Pagination" collapseLabel="Collapse pagination">
          <DataTable.Pagination.Nav
            page={pageIndex + 1}
            totalPages={instance.table.getPageCount()}
            onPageChange={(page) => instance.table.setPageIndex(page - 1)}
            labels={{ prev: 'Previous page', next: 'Next page' }}
          />
          <DataTable.Pagination.Divider />
          <DataTable.Pagination.PageSize
            value={pageSize}
            options={[10, 25, 50]}
            onChange={instance.table.setPageSize}
            label="Rows per page"
          />
        </DataTable.Pagination>
      </div>
    </DataTable>
  )
}

const meta = {
  title: 'Organisms/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { instance: undefined as never, children: null },
  render: () => <ContactsTable rows={CONTACT_ROWS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /^Name/ }))
    const firstCell = canvas.getAllByText(/Andrés|Laura|Ricardo|Sofía/)[0]
    await expect(firstCell).toHaveTextContent('Andrés Gómez')
    const checkboxes = canvas.getAllByRole('checkbox', { name: 'Select row' })
    await userEvent.click(checkboxes[0]!)
    await expect(canvas.getByText('1 contacts selected')).toBeVisible()
  },
}

export const WorstCase: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { instance: undefined as never, children: null },
  render: () => <ContactsTable rows={[WORST_ROW, ...manyRows(500)]} />,
}
