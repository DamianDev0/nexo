import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, selectionColumn, useDataTable } from '@/shared/ui/organisms/data-table'

type Row = { id: string; name: string }

const ROWS: ReadonlyArray<Row> = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id }))

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
    </DataTable>
  )
}

const checked = () =>
  screen
    .getAllByRole('checkbox', { name: 'Select row' })
    .map((box) => box.getAttribute('aria-checked') === 'true')

describe('selectionColumn', () => {
  it('selects the whole range between the last click and a shift-click', async () => {
    render(<Harness />)
    const boxes = screen.getAllByRole('checkbox', { name: 'Select row' })

    await userEvent.click(boxes[0]!)
    expect(checked()).toEqual([true, false, false, false])

    const user = userEvent.setup()
    await user.keyboard('{Shift>}')
    await user.click(boxes[2]!)
    await user.keyboard('{/Shift}')
    expect(checked()).toEqual([true, true, true, false])
  })

  it('keeps plain clicks as single toggles', async () => {
    render(<Harness />)
    const boxes = screen.getAllByRole('checkbox', { name: 'Select row' })

    await userEvent.click(boxes[1]!)
    await userEvent.click(boxes[3]!)
    expect(checked()).toEqual([false, true, false, true])

    await userEvent.click(boxes[1]!)
    expect(checked()).toEqual([false, false, false, true])
  })
})
