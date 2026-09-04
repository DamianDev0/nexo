import { describe, expect, it } from 'vitest'

import { skeletonCells } from '@/views/contacts/lib/skeleton-cells'

describe('skeletonCells', () => {
  it('maps the first width to a select cell and the second to a lead cell', () => {
    const cells = skeletonCells([40, 220, 150])

    expect(cells).toEqual([
      { id: 'col-1', width: 40, kind: 'select' },
      { id: 'col-2', width: 220, kind: 'lead' },
      { id: 'col-3', width: 150, kind: 'plain' },
    ])
  })

  it('returns an empty list for no widths', () => {
    expect(skeletonCells([])).toEqual([])
  })
})
