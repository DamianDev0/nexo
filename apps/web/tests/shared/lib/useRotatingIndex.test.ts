import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRotatingIndex } from '@/shared/lib/hooks/useRotatingIndex'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useRotatingIndex', () => {
  it('cycles through every item and wraps around', () => {
    const { result } = renderHook(() => useRotatingIndex(3, 1000))

    expect(result.current.index).toBe(0)
    act(() => void vi.advanceTimersByTime(1000))
    expect(result.current.index).toBe(1)
    act(() => void vi.advanceTimersByTime(2000))
    expect(result.current.index).toBe(0)
  })

  it('stays put when there is nothing to rotate', () => {
    const { result } = renderHook(() => useRotatingIndex(1, 1000))

    act(() => void vi.advanceTimersByTime(5000))

    expect(result.current.index).toBe(0)
  })

  it('holds while paused and continues after resume', () => {
    const { result } = renderHook(() => useRotatingIndex(3, 1000))

    act(() => result.current.pause())
    act(() => void vi.advanceTimersByTime(3000))
    expect(result.current.index).toBe(0)

    act(() => result.current.resume())
    act(() => void vi.advanceTimersByTime(1000))
    expect(result.current.index).toBe(1)
  })

  it('restarts when the item count changes', () => {
    const { result, rerender } = renderHook(({ length }) => useRotatingIndex(length, 1000), {
      initialProps: { length: 3 },
    })

    act(() => void vi.advanceTimersByTime(2000))
    expect(result.current.index).toBe(2)

    rerender({ length: 2 })
    expect(result.current.index).toBe(0)
  })

  it('never rotates with a non-positive interval', () => {
    const { result } = renderHook(() => useRotatingIndex(3, 0))

    act(() => void vi.advanceTimersByTime(10_000))

    expect(result.current.index).toBe(0)
  })
})
