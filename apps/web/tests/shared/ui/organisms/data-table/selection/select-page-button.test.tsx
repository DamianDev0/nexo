import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, selectionColumn, useDataTable } from '@/shared/ui/organisms/data-table'

type Row = { id: string; name: string }

const ROWS: ReadonlyArray<Row> = [
  { id: '1', name: 'Camila' },
  { id: '2', name: 'Andrés' },
]

const COLUMNS: ReadonlyArray<ColumnDef<Row, unknown>> = [
  selectionColumn<Row>({ all: 'Select all rows', row: 'Select row' }),
  { id: 'name', header: 'Name', accessorKey: 'name' },
]

function Harness() {
  const instance = useDataTable({ data: ROWS, columns: COLUMNS, getRowId: (row) => row.id })

  return (
    <DataTable instance={instance}>
      <DataTable.Grid>
        <DataTable.Header />
        <DataTable.Body />
      </DataTable.Grid>
      <DataTable.Pagination label="Paginación" collapseLabel="Contraer">
        <DataTable.SelectPage labels={{ select: 'Seleccionar página', clear: 'Quitar página' }} />
      </DataTable.Pagination>
    </DataTable>
  )
}

describe('DataTableSelectPage', () => {
  it('selects every visible row, reflects it as pressed and clears on the second press', async () => {
    render(<Harness />)
    const button = screen.getByRole('button', { name: 'Seleccionar página' })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(button)

    const rows = screen.getAllByRole('checkbox', { name: 'Select row' })
    for (const row of rows) expect(row).toHaveAttribute('aria-checked', 'true')
    const pressed = screen.getByRole('button', { name: 'Quitar página' })
    expect(pressed).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(pressed)
    for (const row of screen.getAllByRole('checkbox', { name: 'Select row' }))
      expect(row).toHaveAttribute('aria-checked', 'false')
  })
})
