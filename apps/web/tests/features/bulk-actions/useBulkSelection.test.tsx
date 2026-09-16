import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useBulkSelection } from '@/features/bulk-actions/model/useBulkSelection'

const FILTER = { mode: 'filter', query: { status: 'new' } } as const

function setup(selectedCount = 2, pageSelected = true) {
  const clear = vi.fn()
  const select = vi.fn()
  const hook = renderHook(
    ({ count, selected }: { count: number; selected: boolean }) =>
      useBulkSelection({
        selectedIds: () => ['a', 'b'],
        selectedCount: count,
        total: 40,
        page: { selected, select },
        filterSelection: () => FILTER,
        clear,
      }),
    { initialProps: { count: selectedCount, selected: pageSelected } },
  )
  return { ...hook, clear, select }
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
    rerender({ count: 1, selected: true })
    expect(result.current.allMatching).toBe(false)
  })

  it('checks every row of each page it lands on while the whole filter is selected', () => {
    const { result, rerender, select } = setup(2, false)
    act(() => result.current.selectAll())
    expect(select).toHaveBeenCalledOnce()

    rerender({ count: 25, selected: true })
    expect(result.current.allMatching).toBe(true)

    rerender({ count: 25, selected: false })
    expect(select).toHaveBeenCalledTimes(2)
    rerender({ count: 50, selected: true })
    expect(result.current.allMatching).toBe(true)
  })

  it('lets the user uncheck a row in whole-filter mode without re-checking it', () => {
    const { result, rerender, select } = setup(25, true)
    act(() => result.current.selectAll())
    expect(select).not.toHaveBeenCalled()

    rerender({ count: 24, selected: false })
    expect(result.current.allMatching).toBe(false)
    expect(select).not.toHaveBeenCalled()
  })

  it('reset clears both the mode and the table selection', () => {
    const { result, clear } = setup()
    act(() => result.current.selectAll())
    act(() => result.current.reset())
    expect(result.current.allMatching).toBe(false)
    expect(clear).toHaveBeenCalledOnce()
  })
})
