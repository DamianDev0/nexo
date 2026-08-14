import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useOptionPaneState } from '@/features/manage-settings/model/useOptionPaneState'

describe('useOptionPaneState', () => {
  it('starts on the first page with no editor and no removal', () => {
    const { result } = renderHook(() => useOptionPaneState())

    expect(result.current.page).toBe(1)
    expect(result.current.editorOpen).toBe(false)
    expect(result.current.editingKey).toBeNull()
    expect(result.current.removingKey).toBeNull()
  })

  it('opens the editor in create mode without an editing key', () => {
    const { result } = renderHook(() => useOptionPaneState())

    act(() => result.current.openEdit('vip'))
    act(() => result.current.openCreate())

    expect(result.current.editorOpen).toBe(true)
    expect(result.current.editingKey).toBeNull()
  })

  it('opens the editor in edit mode with the given key', () => {
    const { result } = renderHook(() => useOptionPaneState())

    act(() => result.current.openEdit('vip'))

    expect(result.current.editorOpen).toBe(true)
    expect(result.current.editingKey).toBe('vip')
  })

  it('tracks and clears the removal target', () => {
    const { result } = renderHook(() => useOptionPaneState())

    act(() => result.current.openRemove('vip'))
    expect(result.current.removingKey).toBe('vip')

    act(() => result.current.closeRemove())
    expect(result.current.removingKey).toBeNull()
  })

  it('clamps the page down when the total shrinks below it', () => {
    const { result, rerender } = renderHook(
      ({ totalPages }) => {
        const state = useOptionPaneState()
        state.clampPage(totalPages)
        return state
      },
      { initialProps: { totalPages: 3 } },
    )

    act(() => result.current.setPage(3))
    expect(result.current.page).toBe(3)

    rerender({ totalPages: 2 })

    expect(result.current.page).toBe(2)
  })

  it('leaves the page untouched while it fits within the total', () => {
    const { result } = renderHook(() => {
      const state = useOptionPaneState()
      state.clampPage(5)
      return state
    })

    act(() => result.current.setPage(4))

    expect(result.current.page).toBe(4)
  })
})
