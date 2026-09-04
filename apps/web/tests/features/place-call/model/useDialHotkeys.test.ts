import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCallStore } from '@/features/place-call/model/call.store'
import { useDialHotkeys } from '@/features/place-call/model/useDialHotkeys'

function press(key: string, target: EventTarget = window) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

describe('useDialHotkeys', () => {
  beforeEach(() => {
    useCallStore.setState({
      open: true,
      status: 'idle',
      number: '',
      muted: false,
      startedAt: null,
    })
  })

  it('appends dial characters and deletes with backspace', () => {
    renderHook(() => useDialHotkeys({ enabled: true, onDial: vi.fn() }))

    press('3')
    press('0')
    press('x')
    press('Backspace')

    expect(useCallStore.getState().number).toBe('3')
  })

  it('dials on enter', () => {
    const onDial = vi.fn()
    renderHook(() => useDialHotkeys({ enabled: true, onDial }))

    press('Enter')
    expect(onDial).toHaveBeenCalledOnce()
  })

  it('stays inert when disabled', () => {
    const onDial = vi.fn()
    renderHook(() => useDialHotkeys({ enabled: false, onDial }))

    press('3')
    press('Enter')

    expect(useCallStore.getState().number).toBe('')
    expect(onDial).not.toHaveBeenCalled()
  })

  it('ignores keys typed into editable elements', () => {
    renderHook(() => useDialHotkeys({ enabled: true, onDial: vi.fn() }))

    const input = document.createElement('input')
    document.body.appendChild(input)
    press('3', input)
    input.remove()

    expect(useCallStore.getState().number).toBe('')
  })

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useDialHotkeys({ enabled: true, onDial: vi.fn() }))

    unmount()
    press('3')

    expect(useCallStore.getState().number).toBe('')
  })
})
