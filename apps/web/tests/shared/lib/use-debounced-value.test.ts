import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useDebouncedValue', () => {
  it('starts with the initial value before the delay elapses', () => {
    const { result } = renderHook(() => useDebouncedValue('first', 300))
    expect(result.current).toBe('first')
  })

  it('adopts the new value once the delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })
    expect(result.current).toBe('first')

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('second')
  })

  it('clears the pending timer before scheduling a new one on value change', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')

    const { rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })

    expect(clearSpy).toHaveBeenCalledTimes(1)
  })

  it('clears the pending timer on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')

    const { unmount } = renderHook(() => useDebouncedValue('first', 300))
    unmount()

    expect(clearSpy).toHaveBeenCalledTimes(1)
  })

  it('does not apply a stale intermediate value once the timer is cleared', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })
    act(() => vi.advanceTimersByTime(150))
    rerender({ value: 'third' })
    act(() => vi.advanceTimersByTime(150))

    expect(result.current).toBe('first')

    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe('third')
  })
})
