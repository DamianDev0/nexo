import { describe, expect, it } from 'vitest'

import { resolveTablePhase } from '@/widgets/contacts-board/lib/table-phase'

const BASE = { isPending: false, isUnavailable: false, isFailed: false, isEmpty: false }

describe('resolveTablePhase', () => {
  it('gives the skeleton priority over every other state', () => {
    expect(
      resolveTablePhase({ isPending: true, isUnavailable: true, isFailed: true, isEmpty: true }),
    ).toBe('pending')
  })

  it('reports unavailable before empty', () => {
    expect(resolveTablePhase({ ...BASE, isUnavailable: true, isEmpty: true })).toBe('unavailable')
  })

  it('reports the failure instead of pretending the workspace is empty', () => {
    expect(resolveTablePhase({ ...BASE, isFailed: true, isEmpty: true })).toBe('failed')
  })

  it('reports empty when there is nothing to list', () => {
    expect(resolveTablePhase({ ...BASE, isEmpty: true })).toBe('empty')
  })

  it('renders rows once data is present', () => {
    expect(resolveTablePhase(BASE)).toBe('rows')
  })
})
