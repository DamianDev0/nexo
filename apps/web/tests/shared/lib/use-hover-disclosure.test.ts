import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useHoverDisclosure } from '@/shared/lib/hooks/useHoverDisclosure'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useHoverDisclosure', () => {
  it('starts closed and exposes the full return shape', () => {
    const { result } = renderHook(() => useHoverDisclosure())

    expect(result.current.open).toBe(false)
    expect(typeof result.current.setOpen).toBe('function')
    expect(typeof result.current.hoverProps.onMouseEnter).toBe('function')
    expect(typeof result.current.hoverProps.onMouseLeave).toBe('function')
  })

  it('opens immediately on mouse enter', () => {
    const { result } = renderHook(() => useHoverDisclosure(140))

    act(() => result.current.hoverProps.onMouseEnter())

    expect(result.current.open).toBe(true)
  })

  it('stays open until the close delay fully elapses after mouse leave', () => {
    const { result } = renderHook(() => useHoverDisclosure(140))

    act(() => result.current.hoverProps.onMouseEnter())
    act(() => result.current.hoverProps.onMouseLeave())

    expect(result.current.open).toBe(true)

    act(() => vi.advanceTimersByTime(139))
    expect(result.current.open).toBe(true)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current.open).toBe(false)
  })

  it('honors a custom close delay', () => {
    const { result } = renderHook(() => useHoverDisclosure(500))

    act(() => result.current.hoverProps.onMouseEnter())
    act(() => result.current.hoverProps.onMouseLeave())

    act(() => vi.advanceTimersByTime(140))
    expect(result.current.open).toBe(true)

    act(() => vi.advanceTimersByTime(360))
    expect(result.current.open).toBe(false)
  })

  it('cancels the pending close when the pointer re-enters before the delay elapses', () => {
    const { result } = renderHook(() => useHoverDisclosure(140))

    act(() => result.current.hoverProps.onMouseEnter())
    act(() => result.current.hoverProps.onMouseLeave())
    act(() => result.current.hoverProps.onMouseEnter())

    act(() => vi.advanceTimersByTime(140))

    expect(result.current.open).toBe(true)
  })

  it('uses the latest close delay after it changes between renders', () => {
    const { result, rerender } = renderHook(
      ({ closeDelayMs }: { closeDelayMs: number }) => useHoverDisclosure(closeDelayMs),
      { initialProps: { closeDelayMs: 1000 } },
    )

    rerender({ closeDelayMs: 10 })

    act(() => result.current.hoverProps.onMouseEnter())
    act(() => result.current.hoverProps.onMouseLeave())
    act(() => vi.advanceTimersByTime(10))

    expect(result.current.open).toBe(false)
  })

  it('clears the pending close timer on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { result, unmount } = renderHook(() => useHoverDisclosure(140))

    act(() => result.current.hoverProps.onMouseEnter())
    act(() => result.current.hoverProps.onMouseLeave())
    clearSpy.mockClear()

    unmount()

    expect(clearSpy).toHaveBeenCalled()
  })

  it('exposes setOpen so callers can force the open state directly', () => {
    const { result } = renderHook(() => useHoverDisclosure())

    act(() => result.current.setOpen(true))
    expect(result.current.open).toBe(true)

    act(() => result.current.setOpen(false))
    expect(result.current.open).toBe(false)
  })
})
