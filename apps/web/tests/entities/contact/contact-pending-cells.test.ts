import { describe, expect, it } from 'vitest'

import {
  columnFields,
  isColumnSaving,
  pendingCellToken,
} from '@/entities/contact/lib/contact-pending-cells'

describe('contact pending cells', () => {
  it('maps a column to the contact fields it renders', () => {
    expect(columnFields('assignedTo')).toEqual(['assignedToId', 'assignedToName'])
    expect(columnFields('custom:eps')).toEqual(['customFields'])
    expect(columnFields('unknown')).toEqual([])
  })

  it('reports saving only for the column that owns a pending field', () => {
    const cells = new Set([pendingCellToken('c1', 'assignedToId')])

    expect(isColumnSaving(cells, 'c1', 'assignedTo')).toBe(true)
    expect(isColumnSaving(cells, 'c1', 'status')).toBe(false)
    expect(isColumnSaving(cells, 'c2', 'assignedTo')).toBe(false)
    expect(isColumnSaving(undefined, 'c1', 'assignedTo')).toBe(false)
  })
})
