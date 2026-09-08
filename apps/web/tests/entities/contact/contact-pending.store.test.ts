import { beforeEach, describe, expect, it } from 'vitest'

import { usePendingContactPatches } from '@/entities/contact/model/contact-pending.store'

describe('usePendingContactPatches', () => {
  beforeEach(() =>
    usePendingContactPatches.getState().end([...usePendingContactPatches.getState().ids]),
  )

  it('tracks ids across overlapping patches', () => {
    const store = usePendingContactPatches.getState()
    store.begin(['a', 'b'])
    store.begin(['b', 'c'])
    expect([...usePendingContactPatches.getState().ids].sort()).toEqual(['a', 'b', 'c'])

    store.end(['b'])
    expect([...usePendingContactPatches.getState().ids].sort()).toEqual(['a', 'c'])
  })

  it('returns to the shared empty set once nothing is pending', () => {
    const empty = usePendingContactPatches.getState().ids
    usePendingContactPatches.getState().begin(['a'])
    usePendingContactPatches.getState().end(['a'])
    expect(usePendingContactPatches.getState().ids).toBe(empty)
  })
})
