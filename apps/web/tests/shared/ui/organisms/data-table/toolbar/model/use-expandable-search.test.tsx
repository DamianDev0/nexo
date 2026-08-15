import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, useDataTable } from '@/shared/ui/organisms/data-table'

const COLUMNS: ReadonlyArray<ColumnDef<{ id: string }, unknown>> = [
  { id: 'name', header: 'Name', accessorKey: 'id' },
]

function Harness({ initial = '' }: Readonly<{ initial?: string }>) {
  const instance = useDataTable({ data: [], columns: COLUMNS })
  const [value, setValue] = useState(initial)

  return (
    <DataTable instance={instance}>
      <DataTable.Toolbar>
        <DataTable.Search
          value={value}
          placeholder="Nombre, email o teléfono"
          onChange={setValue}
        />
      </DataTable.Toolbar>
      <span data-testid="query">{value}</span>
    </DataTable>
  )
}

const toggle = () => screen.getByRole('button', { name: /search/i })
const input = () => screen.queryByPlaceholderText('Nombre, email o teléfono')

describe('DataTableSearch', () => {
  it('starts collapsed with no input mounted', () => {
    render(<Harness />)

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(input()).not.toBeInTheDocument()
  })

  it('expands and focuses the input on toggle', async () => {
    render(<Harness />)

    await userEvent.click(toggle())

    const field = await screen.findByPlaceholderText('Nombre, email o teléfono')
    expect(field).toHaveFocus()
    expect(toggle()).toHaveAttribute('aria-expanded', 'true')
  })

  it('starts expanded when a search is already active', () => {
    render(<Harness initial="ana" />)

    expect(input()).toHaveValue('ana')
  })

  it('clears the query when collapsing', async () => {
    render(<Harness initial="ana" />)

    await userEvent.click(toggle())

    expect(screen.getByTestId('query')).toBeEmptyDOMElement()
    await waitFor(() => expect(input()).not.toBeInTheDocument())
  })

  it('closes and clears on Escape', async () => {
    render(<Harness initial="ana" />)

    await userEvent.keyboard('{Escape}')

    expect(screen.getByTestId('query')).toBeEmptyDOMElement()
    await waitFor(() => expect(input()).not.toBeInTheDocument())
  })

  it('reports every keystroke to the owner', async () => {
    render(<Harness />)

    await userEvent.click(toggle())
    await userEvent.type(await screen.findByPlaceholderText('Nombre, email o teléfono'), 'be')

    expect(input()).toHaveValue('be')
  })
})
