import { renderHook } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { useHotkey } from '@/shared/lib/hooks/useHotkey'

beforeAll(() => {
  Object.defineProperty(window.navigator, 'platform', { value: 'MacIntel', configurable: true })
})

function pressKey(key: string, init: KeyboardEventInit = {}, target: EventTarget = window) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

describe('useHotkey', () => {
  it('fires and prevents default on match', () => {
    const onTrigger = vi.fn()
    renderHook(() => useHotkey(['mod', 'S'], onTrigger))
    const event = pressKey('s', { metaKey: true })
    expect(onTrigger).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })

  it('ignores non-matching keys', () => {
    const onTrigger = vi.fn()
    renderHook(() => useHotkey(['mod', 'S'], onTrigger))
    pressKey('s')
    pressKey('k', { metaKey: true })
    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('does nothing when disabled', () => {
    const onTrigger = vi.fn()
    renderHook(() => useHotkey(['mod', 'S'], onTrigger, { enabled: false }))
    pressKey('s', { metaKey: true })
    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('skips single-key shortcuts while typing in an input', () => {
    const onTrigger = vi.fn()
    renderHook(() => useHotkey(['F'], onTrigger))
    const input = document.createElement('input')
    document.body.appendChild(input)
    pressKey('f', {}, input)
    expect(onTrigger).not.toHaveBeenCalled()
    input.remove()
  })

  it('allows typing targets when allowInEditable is set', () => {
    const onTrigger = vi.fn()
    renderHook(() => useHotkey(['esc'], onTrigger, { allowInEditable: true }))
    const input = document.createElement('input')
    document.body.appendChild(input)
    pressKey('Escape', {}, input)
    expect(onTrigger).toHaveBeenCalledOnce()
    input.remove()
  })

  it('cleans up its listener on unmount', () => {
    const onTrigger = vi.fn()
    const { unmount } = renderHook(() => useHotkey(['mod', 'S'], onTrigger))
    unmount()
    pressKey('s', { metaKey: true })
    expect(onTrigger).not.toHaveBeenCalled()
  })
})
