import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useComposerPreload } from '@/features/compose-contact-actions/model/useComposerPreload'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useComposerPreload', () => {
  it('warms the composer chunks while the browser is idle', () => {
    const requestIdleCallback = vi.fn()
    vi.stubGlobal('requestIdleCallback', requestIdleCallback)
    vi.stubGlobal('cancelIdleCallback', vi.fn())

    const { unmount } = renderHook(() => useComposerPreload())

    expect(requestIdleCallback).toHaveBeenCalledOnce()
    unmount()
  })

  it('hands the idle slot back when the screen goes away', () => {
    const cancelIdleCallback = vi.fn()
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn(() => 42),
    )
    vi.stubGlobal('cancelIdleCallback', cancelIdleCallback)

    renderHook(() => useComposerPreload()).unmount()

    expect(cancelIdleCallback).toHaveBeenCalledWith(42)
  })

  it('falls back to a timer where idle callbacks do not exist', () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestIdleCallback', undefined)
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')

    const { unmount } = renderHook(() => useComposerPreload())

    expect(setTimeoutSpy).toHaveBeenCalled()
    unmount()
  })
})
