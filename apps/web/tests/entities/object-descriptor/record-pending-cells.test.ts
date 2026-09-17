import { describe, expect, it } from 'vitest'

import {
  isColumnSaving,
  pendingCellToken,
} from '@/entities/object-descriptor/lib/record-pending-cells'

describe('record pending cells', () => {
  it('reports saving only when one of the column fields is pending for that record', () => {
    const cells = new Set([pendingCellToken('c1', 'assignedToId')])
    const ownerFields = ['assignedToId', 'assignedToName']

    expect(isColumnSaving(cells, 'c1', ownerFields)).toBe(true)
    expect(isColumnSaving(cells, 'c1', ['status'])).toBe(false)
    expect(isColumnSaving(cells, 'c2', ownerFields)).toBe(false)
    expect(isColumnSaving(undefined, 'c1', ownerFields)).toBe(false)
    expect(isColumnSaving(cells, 'c1', [])).toBe(false)
  })
})
