import { describe, expect, it } from 'vitest'

import { resolveTablePhase } from '@/widgets/contacts-board/lib/table-phase'

describe('resolveTablePhase', () => {
  it('gives the skeleton priority over every other state', () => {
    expect(resolveTablePhase({ isPending: true, isUnavailable: true, isEmpty: true })).toBe(
      'pending',
    )
  })

  it('reports unavailable before empty', () => {
    expect(resolveTablePhase({ isPending: false, isUnavailable: true, isEmpty: true })).toBe(
      'unavailable',
    )
  })

  it('reports empty when there is nothing to list', () => {
    expect(resolveTablePhase({ isPending: false, isUnavailable: false, isEmpty: true })).toBe(
      'empty',
    )
  })

  it('renders rows once data is present', () => {
    expect(resolveTablePhase({ isPending: false, isUnavailable: false, isEmpty: false })).toBe(
      'rows',
    )
  })
})
