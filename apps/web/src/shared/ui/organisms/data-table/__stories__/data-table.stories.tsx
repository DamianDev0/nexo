'use client'

import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { AvatarSquircle } from '../../../atoms/avatar-squircle'
import { BadgeSoft } from '../../../atoms/badge-soft'
import { TrashIcon } from '../../../icons'
import { Button } from '../../../shadcn/button'
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
    meta: { lockable: true },
    cell: ({ row }) => (
      <span className="flex min-w-0 items-center gap-3">
        <AvatarSquircle initials={row.original.initials} tone={row.original.tone} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {row.original.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{row.original.role}</span>
        </span>
      </span>
    ),
  },
  {
    id: 'company',
    accessorKey: 'company',
    header: 'Company',
    size: 200,
    cell: ({ getValue }) => <DataTable.CellText>{String(getValue())}</DataTable.CellText>,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Lead status',
    size: 130,
    meta: { lockable: true },
    cell: ({ row }) => {
      const status = STATUS_TONE[row.original.status]
      return <BadgeSoft tone={status.tone}>{status.label}</BadgeSoft>
    },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    size: 220,
    meta: { grow: true },
    cell: ({ getValue }) => <DataTable.CellText muted>{String(getValue())}</DataTable.CellText>,
  },
  {
    id: 'city',
    accessorKey: 'city',
    header: 'City',
    size: 120,
    cell: ({ getValue }) => <DataTable.CellText>{String(getValue())}</DataTable.CellText>,
  },
]

const LAYOUT = { value: { pinnedLeft: ['name'] }, onChange: () => undefined }

const BULK_LABELS = {
  selected: (count: number) => `${count} selected`,
  selectAll: (total: number) => `Select all ${total}`,
  clear: 'Clear selection',
}

function ContactsTable({ rows }: Readonly<{ rows: ReadonlyArray<ContactRow> }>) {
  const instance = useDataTable({
    data: rows,
    columns: COLUMNS,
    getRowId: (row) => row.id,
    layout: LAYOUT,
  })
  const [search, setSearch] = useState('')
  const [activeList, setActiveList] = useState('all')
  const { pageIndex, pageSize } = instance.table.getState().pagination

  return (
    <div className="flex h-136 min-h-0 flex-col">
      <DataTable.SmartLists
        data={{ items: SMART_LISTS, activeId: activeList }}
        onSelect={setActiveList}
      />
      <div className="min-h-0 flex-1 px-4 pb-4 pt-1">
        <DataTable
          instance={instance}
          className="flex h-full min-h-0 flex-col border border-border"
        >
          <DataTable.Toolbar
            bulk={{
              labels: BULK_LABELS,
              onSelectAll: () => instance.table.toggleAllRowsSelected(true),
              actions: (
                <Button variant="ghost" size="icon-sm" aria-label="Archive">
                  <TrashIcon className="size-4" />
                </Button>
              ),
            }}
          >
            <DataTable.Search
              value={search}
              placeholder="Name, address, email, phone or ZIP"
              onChange={setSearch}
            />
            <DataTable.Density className="ml-auto" />
          </DataTable.Toolbar>
          <DataTable.Scroller className="min-h-0 flex-1">
            <DataTable.Grid>
              <DataTable.Header />
              <DataTable.Body />
            </DataTable.Grid>
          </DataTable.Scroller>
          <div className="flex justify-center py-3">
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
      </div>
    </div>
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
    const sortByName = canvasElement.querySelector<HTMLElement>('[data-slot="table-sort"]')!
    await userEvent.click(sortByName)
    const firstCell = canvas.getAllByText(/Andrés|Laura|Ricardo|Sofía/)[0]
    await expect(firstCell).toHaveTextContent('Andrés Gómez')
    const checkboxes = canvas.getAllByRole('checkbox', { name: 'Select row' })
    await userEvent.click(checkboxes[0]!)
    await expect(checkboxes[0]!).toBeChecked()
    await expect(checkboxes[0]!.closest('tr')).toHaveAttribute('data-state', 'selected')
  },
}

export const WorstCase: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: { instance: undefined as never, children: null },
  render: () => <ContactsTable rows={[WORST_ROW, ...manyRows(500)]} />,
}
