import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, useDataTable } from '@/shared/ui/organisms/data-table'

type Row = { id: string; name: string }

const ROWS: ReadonlyArray<Row> = [
  { id: '1', name: 'Camila' },
  { id: '2', name: 'Andrés' },
]

const COLUMNS: ReadonlyArray<ColumnDef<Row, unknown>> = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
]

function Harness({ onArchive }: Readonly<{ onArchive: (row: Row) => void }>) {
  const instance = useDataTable({
    data: ROWS,
    columns: COLUMNS,
    getRowId: (row) => row.id,
    rowContextMenu: (row) => [
      { id: 'archive', label: `Archivar ${row.name}`, onClick: () => onArchive(row) },
    ],
  })
  return (
    <DataTable instance={instance}>
      <DataTable.Grid>
        <DataTable.Body />
      </DataTable.Grid>
    </DataTable>
  )
}

describe('DataTableRow context menu', () => {
  it('opens the row actions on right click and runs the picked one', async () => {
    const onArchive = vi.fn()
    render(<Harness onArchive={onArchive} />)

    fireEvent.contextMenu(screen.getByText('Andrés'))
    const item = await screen.findByRole('menuitem', { name: 'Archivar Andrés' })
    await userEvent.click(item)

    expect(onArchive).toHaveBeenCalledWith(ROWS[1])
  })
})
