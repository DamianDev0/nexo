import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  useSaveShortcut,
  useSaveShortcutLabel,
} from '@/features/manage-settings/model/useSaveShortcut'

function pressSaveKey(init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key: 's', metaKey: true, ...init })
  const prevented = vi.spyOn(event, 'preventDefault')
  window.dispatchEvent(event)
  return prevented
}

describe('useSaveShortcut', () => {
  it('saves and prevents the browser dialog on meta+s when saving is possible', () => {
    const onSave = vi.fn()
    renderHook(() => useSaveShortcut({ onSave, canSave: true }))

    const prevented = pressSaveKey()

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(prevented).toHaveBeenCalled()
  })

  it('supports ctrl+s', () => {
    const onSave = vi.fn()
    renderHook(() => useSaveShortcut({ onSave, canSave: true }))

    pressSaveKey({ metaKey: false, ctrlKey: true })

    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('prevents the browser dialog but does not save when there is nothing to save', () => {
    const onSave = vi.fn()
    renderHook(() => useSaveShortcut({ onSave, canSave: false }))

    const prevented = pressSaveKey()

    expect(onSave).not.toHaveBeenCalled()
    expect(prevented).toHaveBeenCalled()
  })

  it('ignores plain s and other modified keys', () => {
    const onSave = vi.fn()
    renderHook(() => useSaveShortcut({ onSave, canSave: true }))

    pressSaveKey({ metaKey: false })
    pressSaveKey({ key: 'k' })

    expect(onSave).not.toHaveBeenCalled()
  })

  it('picks up canSave changes across rerenders', () => {
    const onSave = vi.fn()
    const { rerender } = renderHook(
      ({ canSave }: { canSave: boolean }) => useSaveShortcut({ onSave, canSave }),
      { initialProps: { canSave: false } },
    )

    pressSaveKey()
    expect(onSave).not.toHaveBeenCalled()

    rerender({ canSave: true })
    pressSaveKey()
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('does nothing without a handler and stops listening on unmount', () => {
    const onSave = vi.fn()
    renderHook(() => useSaveShortcut({ onSave: null, canSave: true }))
    pressSaveKey()
    expect(onSave).not.toHaveBeenCalled()

    const { unmount } = renderHook(() => useSaveShortcut({ onSave, canSave: true }))
    unmount()
    pressSaveKey()
    expect(onSave).not.toHaveBeenCalled()
  })
})

describe('useSaveShortcutLabel', () => {
  it('derives the label from the platform', () => {
    const { result } = renderHook(() => useSaveShortcutLabel())

    expect(['⌘S', 'Ctrl+S']).toContain(result.current)
  })
})
