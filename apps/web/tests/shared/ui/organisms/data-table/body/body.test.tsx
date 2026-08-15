import { render, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, useDataTable } from '@/shared/ui/organisms/data-table'

type Row = { id: string; name: string }

const DATA: ReadonlyArray<Row> = [
  { id: '1', name: 'Camila' },
  { id: '2', name: 'Andrés' },
]

const COLUMNS: ReadonlyArray<ColumnDef<Row, unknown>> = [
  { id: 'name', accessorKey: 'name', size: 200 },
]

function renderBody(dimmed?: boolean) {
  const { result } = renderHook(() =>
    useDataTable<Row>({ data: DATA, columns: COLUMNS, getRowId: (row) => row.id }),
  )

  return render(
    <DataTable instance={result.current}>
      <DataTable.Grid>
        <DataTable.Body dimmed={dimmed} />
      </DataTable.Grid>
    </DataTable>,
  )
}

describe('DataTableBody', () => {
  it('paints the rows visible on first render instead of fading them in', () => {
    const { container } = renderBody()
    const body = container.querySelector('[data-slot="table-body"]')

    expect(body).toBeInTheDocument()
    expect(body).not.toHaveStyle({ opacity: '0' })
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
  })

  it('dims the rows it is keeping on screen while the next page loads', () => {
    const { container } = renderBody(true)

    expect(container.querySelector('[data-slot="table-body"]')).toHaveStyle({ opacity: '0.55' })
  })
})
