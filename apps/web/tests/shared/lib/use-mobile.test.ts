import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useIsMobile } from '@/shared/lib/hooks/use-mobile'

function stubMatchMedia(matches: boolean) {
  const addEventListener = vi.fn()
  const removeEventListener = vi.fn()
  const matchMediaSpy = vi.fn(() => ({ matches, addEventListener, removeEventListener }))
  vi.stubGlobal('matchMedia', matchMediaSpy)
  return { matchMediaSpy, addEventListener, removeEventListener }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useIsMobile', () => {
  it('reports mobile when the viewport is under the breakpoint', () => {
    stubMatchMedia(true)
    vi.stubGlobal('innerWidth', 600)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('reports desktop right at the breakpoint boundary', () => {
    stubMatchMedia(false)
    vi.stubGlobal('innerWidth', 768)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('queries the exact breakpoint media query, one pixel under 768', () => {
    const { matchMediaSpy } = stubMatchMedia(false)
    vi.stubGlobal('innerWidth', 1024)

    renderHook(() => useIsMobile())

    expect(matchMediaSpy).toHaveBeenCalledWith('(max-width: 767px)')
  })

  it('updates when the registered change listener fires after a resize', () => {
    const { addEventListener } = stubMatchMedia(false)
    vi.stubGlobal('innerWidth', 1024)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    vi.stubGlobal('innerWidth', 500)
    const [, registeredHandler] = addEventListener.mock.calls[0] as [string, () => void]
    act(() => registeredHandler())

    expect(result.current).toBe(true)
  })

  it('reports desktop again once the change listener fires back at the exact boundary', () => {
    const { addEventListener } = stubMatchMedia(false)
    vi.stubGlobal('innerWidth', 1024)

    const { result } = renderHook(() => useIsMobile())
    const [, registeredHandler] = addEventListener.mock.calls[0] as [string, () => void]

    vi.stubGlobal('innerWidth', 500)
    act(() => registeredHandler())
    expect(result.current).toBe(true)

    vi.stubGlobal('innerWidth', 768)
    act(() => registeredHandler())

    expect(result.current).toBe(false)
  })

  it('registers the change listener with the exact event name', () => {
    const { addEventListener } = stubMatchMedia(false)
    vi.stubGlobal('innerWidth', 1024)

    renderHook(() => useIsMobile())

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('unregisters the change listener on unmount using the exact event name and handler', () => {
    const { addEventListener, removeEventListener } = stubMatchMedia(false)
    vi.stubGlobal('innerWidth', 1024)

    const { unmount } = renderHook(() => useIsMobile())
    const [, registeredHandler] = addEventListener.mock.calls[0] as [string, () => void]

    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('change', registeredHandler)
  })

  it('coerces the undefined initial state to a boolean', () => {
    stubMatchMedia(false)
    vi.stubGlobal('innerWidth', 1024)

    const { result } = renderHook(() => useIsMobile())

    expect(typeof result.current).toBe('boolean')
  })
})
