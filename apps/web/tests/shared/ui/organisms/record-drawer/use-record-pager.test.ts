import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRecordPager } from '@/shared/ui/organisms/record-drawer/model/use-record-pager'

type Item = { id: string }

const ITEMS: Item[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
const getId = (item: Item) => item.id

function press(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
}

describe('useRecordPager', () => {
  it('locates the current record and exposes bounds', () => {
    const { result } = renderHook(() =>
      useRecordPager({ items: ITEMS, current: ITEMS[1] ?? null, getId, onSelect: vi.fn() }),
    )
    expect(result.current).toMatchObject({ index: 1, total: 3, hasPrev: true, hasNext: true })
  })

  it('returns null when the current record is not in the list', () => {
    const { result } = renderHook(() =>
      useRecordPager({ items: ITEMS, current: { id: 'zz' }, getId, onSelect: vi.fn() }),
    )
    expect(result.current).toBeNull()
  })

  it('selects neighbours and refuses to leave the bounds', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() =>
      useRecordPager({ items: ITEMS, current: ITEMS[0] ?? null, getId, onSelect }),
    )
    act(() => result.current?.prev())
    expect(onSelect).not.toHaveBeenCalled()
    act(() => result.current?.next())
    expect(onSelect).toHaveBeenCalledWith(ITEMS[1])
  })

  it('pages with the arrow keys and j/k while enabled', () => {
    const onSelect = vi.fn()
    renderHook(() => useRecordPager({ items: ITEMS, current: ITEMS[1] ?? null, getId, onSelect }))
    press('ArrowRight')
    expect(onSelect).toHaveBeenLastCalledWith(ITEMS[2])
    press('k')
    expect(onSelect).toHaveBeenLastCalledWith(ITEMS[0])
  })

  it('ignores hotkeys when disabled', () => {
    const onSelect = vi.fn()
    renderHook(() =>
      useRecordPager({
        items: ITEMS,
        current: ITEMS[1] ?? null,
        getId,
        onSelect,
        enabled: false,
      }),
    )
    press('ArrowRight')
    expect(onSelect).not.toHaveBeenCalled()
  })
})
