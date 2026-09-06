import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, selectionColumn, useDataTable } from '@/shared/ui/organisms/data-table'

interface Row {
  readonly id: string
  readonly name: string
}

const ROWS: readonly Row[] = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Beto' },
]

const COLUMNS: ReadonlyArray<ColumnDef<Row, unknown>> = [
  selectionColumn<Row>({ all: 'Select all rows', row: 'Select row' }),
  { id: 'name', header: 'Name', accessorKey: 'name' },
]

const LABELS = {
  selected: (count: number) => `${count} seleccionados`,
  selectAll: (total: number) => `Seleccionar los ${total}`,
  clear: 'Limpiar selección',
}

function Harness({ onSelectAll }: Readonly<{ onSelectAll?: () => void }>) {
  const instance = useDataTable({
    data: ROWS,
    columns: COLUMNS,
    getRowId: (row) => row.id,
    totalRows: 3587,
  })

  return (
    <DataTable instance={instance}>
      <DataTable.Toolbar bulk={{ labels: LABELS, onSelectAll, actions: <span>bulk-actions</span> }}>
        <DataTable.Search value="" placeholder="Buscar" onChange={vi.fn()} />
      </DataTable.Toolbar>
      <DataTable.Grid>
        <DataTable.Header />
        <DataTable.Body pageKey={1} />
      </DataTable.Grid>
    </DataTable>
  )
}

describe('DataTable.Toolbar bulk swap', () => {
  it('shows the search until a row is selected', async () => {
    render(<Harness />)

    expect(document.querySelector('[data-slot="table-search"]')).toBeInTheDocument()
    expect(screen.queryByText('1 seleccionados')).not.toBeInTheDocument()

    await userEvent.click(screen.getAllByLabelText('Select row')[0]!)

    expect(await screen.findByText('1 seleccionados')).toBeInTheDocument()
    expect(screen.getByText('bulk-actions')).toBeInTheDocument()
    await waitFor(() =>
      expect(document.querySelector('[data-slot="table-search"]')).not.toBeInTheDocument(),
    )
  })

  it('restores the search when the selection is cleared', async () => {
    render(<Harness />)

    await userEvent.click(screen.getAllByLabelText('Select row')[0]!)
    await userEvent.click(await screen.findByLabelText('Limpiar selección'))

    await waitFor(() =>
      expect(document.querySelector('[data-slot="table-search"]')).toBeInTheDocument(),
    )
  })

  it('counts every selected row', async () => {
    render(<Harness />)

    await userEvent.click(screen.getByLabelText('Select all rows'))

    expect(await screen.findByText('2 seleccionados')).toBeInTheDocument()
  })

  it('offers select-all against the server total only when the feature handles it', async () => {
    const onSelectAll = vi.fn()
    const { rerender } = render(<Harness />)

    await userEvent.click(screen.getAllByLabelText('Select row')[0]!)
    await screen.findByText('1 seleccionados')
    expect(screen.queryByText('Seleccionar los 3587')).not.toBeInTheDocument()

    rerender(<Harness onSelectAll={onSelectAll} />)
    await userEvent.click(await screen.findByText('Seleccionar los 3587'))

    expect(onSelectAll).toHaveBeenCalledOnce()
  })
})
