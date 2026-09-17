import { beforeEach, describe, expect, it } from 'vitest'

import { usePendingRecordPatches } from '@/entities/object-descriptor/model/record-pending.store'

const state = () => usePendingRecordPatches.getState()

describe('usePendingRecordPatches', () => {
  beforeEach(() => state().end([...state().ids]))

  it('tracks ids and cells across overlapping patches', () => {
    state().begin([
      { id: 'a', keys: ['status'] },
      { id: 'b', keys: ['tags'] },
    ])
    state().begin([
      { id: 'b', keys: ['status'] },
      { id: 'c', keys: ['city'] },
    ])

    expect([...state().ids].sort()).toEqual(['a', 'b', 'c'])
    expect([...state().cells].sort()).toEqual(['a:status', 'b:status', 'b:tags', 'c:city'])

    state().end(['b'])
    expect([...state().ids].sort()).toEqual(['a', 'c'])
    expect([...state().cells].sort()).toEqual(['a:status', 'c:city'])
  })

  it('returns to the shared empty sets once nothing is pending', () => {
    const emptyIds = state().ids
    const emptyCells = state().cells
    state().begin([{ id: 'a', keys: ['status'] }])
    state().end(['a'])
    expect(state().ids).toBe(emptyIds)
    expect(state().cells).toBe(emptyCells)
  })
})
