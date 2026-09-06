import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useBulkSelection } from '@/features/bulk-actions/model/useBulkSelection'

const FILTER = { mode: 'filter', query: { status: 'new' } } as const

function setup(selectedCount = 2) {
  const clear = vi.fn()
  const hook = renderHook(
    ({ count }: { count: number }) =>
      useBulkSelection({
        selectedIds: () => ['a', 'b'],
        selectedCount: count,
        total: 40,
        filterSelection: () => FILTER,
        clear,
      }),
    { initialProps: { count: selectedCount } },
  )
  return { ...hook, clear }
}

describe('useBulkSelection', () => {
  it('targets the checked rows by default and the whole filter after select-all', () => {
    const { result } = setup()
    expect(result.current.current()).toEqual({ mode: 'ids', ids: ['a', 'b'] })
    expect(result.current.count).toBe(2)

    act(() => result.current.selectAll())
    expect(result.current.allMatching).toBe(true)
    expect(result.current.current()).toEqual(FILTER)
    expect(result.current.count).toBe(40)
  })

  it('drops whole-filter mode as soon as the row selection changes', () => {
    const { result, rerender } = setup()
    act(() => result.current.selectAll())
    rerender({ count: 1 })
    expect(result.current.allMatching).toBe(false)
  })

  it('reset clears both the mode and the table selection', () => {
    const { result, clear } = setup()
    act(() => result.current.selectAll())
    act(() => result.current.reset())
    expect(result.current.allMatching).toBe(false)
    expect(clear).toHaveBeenCalledOnce()
  })
})
