import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useSmartListHotkeys } from '@/shared/ui/organisms/data-table/smart-list/model/use-smart-list-hotkeys'

function press(key: string, target?: HTMLElement) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true })
  ;(target ?? window).dispatchEvent(event)
}

describe('useSmartListHotkeys', () => {
  it('selects the nth list on a digit key', () => {
    const onSelect = vi.fn()
    renderHook(() => useSmartListHotkeys(['all', 'new', 'client'], onSelect, true))

    press('2')

    expect(onSelect).toHaveBeenCalledWith('new')
  })

  it('ignores digits beyond the list length and when disabled', () => {
    const onSelect = vi.fn()
    const { rerender } = renderHook(
      ({ enabled }) => useSmartListHotkeys(['all'], onSelect, enabled),
      { initialProps: { enabled: true } },
    )

    press('5')
    rerender({ enabled: false })
    press('1')

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('ignores keystrokes while typing in an input', () => {
    const onSelect = vi.fn()
    renderHook(() => useSmartListHotkeys(['all', 'new'], onSelect, true))

    const input = document.createElement('input')
    document.body.append(input)
    press('1', input)
    input.remove()

    expect(onSelect).not.toHaveBeenCalled()
  })
})
