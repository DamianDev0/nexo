import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, selectionColumn, useDataTable } from '@/shared/ui/organisms/data-table'

type Row = { readonly id: string; readonly name: string }

const ROWS: readonly Row[] = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Beto' },
]

const COLUMNS: ReadonlyArray<ColumnDef<Row, unknown>> = [
  selectionColumn<Row>({ all: 'Select all rows', row: 'Select row' }),
  { id: 'name', header: 'Name', accessorKey: 'name' },
]

const LABELS = {
  pageSelected: (count: number) => `Page ${count} selected`,
  allSelected: (total: number) => `All ${total} selected`,
  selectAll: (total: number) => `Select all ${total}`,
  clear: 'Clear selection',
}

function Harness({
  allSelected,
  onSelectAll,
  onClear,
}: Readonly<{ allSelected: boolean; onSelectAll: () => void; onClear: () => void }>) {
  const instance = useDataTable({
    data: ROWS,
    columns: COLUMNS,
    getRowId: (row) => row.id,
    totalRows: 64,
  })

  return (
    <DataTable instance={instance}>
      <DataTable.SelectionBanner
        allSelected={allSelected}
        labels={LABELS}
        onSelectAll={onSelectAll}
        onClear={onClear}
      />
      <DataTable.Grid>
        <DataTable.Header />
        <DataTable.Body pageKey={1} />
      </DataTable.Grid>
    </DataTable>
  )
}

describe('DataTableSelectionBanner', () => {
  it('stays hidden until the whole page is selected, then offers the server total', async () => {
    const onSelectAll = vi.fn()
    render(<Harness allSelected={false} onSelectAll={onSelectAll} onClear={vi.fn()} />)

    expect(screen.queryByText(/selected/)).not.toBeInTheDocument()

    await userEvent.click(screen.getAllByLabelText('Select row')[0]!)
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Select all rows'))
    expect(await screen.findByText('Page 2 selected')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Select all 64'))
    expect(onSelectAll).toHaveBeenCalledOnce()
  })

  it('reports the whole list and clears it once every record is targeted', async () => {
    const onClear = vi.fn()
    render(<Harness allSelected onSelectAll={vi.fn()} onClear={onClear} />)

    expect(screen.getByText('All 64 selected')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Clear selection'))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
