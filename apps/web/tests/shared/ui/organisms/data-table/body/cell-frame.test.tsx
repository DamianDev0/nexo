import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { queryWrapper as wrapper } from '../../../../../query-wrapper'

import { DataTable } from '@/shared/ui/organisms/data-table'

describe('DataTable.CellHint', () => {
  it('exposes the hint as an accessible image label', () => {
    render(<DataTable.CellHint hint="No contactar">x</DataTable.CellHint>, { wrapper })

    expect(screen.getByRole('img', { name: 'No contactar' })).toBeInTheDocument()
  })
})

describe('DataTable.CellFrame', () => {
  it('stacks the value over its actions by default', () => {
    const { container } = render(
      <DataTable.CellFrame display="+57 300 123 4567">
        <span>action</span>
      </DataTable.CellFrame>,
      { wrapper },
    )

    expect(screen.getByText('+57 300 123 4567')).toBeInTheDocument()
    expect(screen.getByText('action')).toBeInTheDocument()
    expect(container.querySelector('.flex-col')).not.toBeNull()
  })

  it('keeps the value and its actions on one line when dense', () => {
    const { container } = render(
      <DataTable.CellFrame dense display="value">
        <span>action</span>
      </DataTable.CellFrame>,
      { wrapper },
    )

    expect(container.querySelector('.flex-col')).toBeNull()
  })
})
