import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCallClock } from '@/features/place-call/model/useCallClock'

describe('useCallClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns zero without a start time', () => {
    const { result } = renderHook(() => useCallClock(null))
    expect(result.current).toBe(0)
  })

  it('counts elapsed seconds from the start time', () => {
    const startedAt = Date.now()
    const { result } = renderHook(() => useCallClock(startedAt))

    act(() => vi.advanceTimersByTime(3000))
    expect(result.current).toBe(3)

    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current).toBe(63)
  })

  it('picks up elapsed time from a start in the past', () => {
    const startedAt = Date.now() - 5000
    const { result } = renderHook(() => useCallClock(startedAt))

    act(() => vi.advanceTimersByTime(0))
    expect(result.current).toBe(5)
  })

  it('drops back to zero when the start time clears', () => {
    const { result, rerender } = renderHook(({ startedAt }) => useCallClock(startedAt), {
      initialProps: { startedAt: Date.now() as number | null },
    })

    act(() => vi.advanceTimersByTime(4000))
    expect(result.current).toBe(4)

    rerender({ startedAt: null })
    expect(result.current).toBe(0)
  })
})
