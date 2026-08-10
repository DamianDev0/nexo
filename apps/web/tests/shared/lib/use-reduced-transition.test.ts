import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useReducedTransition } from '@/shared/lib/animations/useReducedTransition'
import { instant } from '@/shared/lib/animations/variants'

const { useReducedMotion } = vi.hoisted(() => ({ useReducedMotion: vi.fn() }))

vi.mock('motion/react', () => ({ useReducedMotion }))

describe('useReducedTransition', () => {
  it('returns the given transition untouched when motion is not reduced', () => {
    useReducedMotion.mockReturnValue(false)
    const transition = { duration: 0.3, ease: 'linear' }

    const { result } = renderHook(() => useReducedTransition(transition))

    expect(result.current).toBe(transition)
  })

  it('swaps in the instant transition when the user prefers reduced motion', () => {
    useReducedMotion.mockReturnValue(true)
    const transition = { duration: 0.5, ease: 'linear' }

    const { result } = renderHook(() => useReducedTransition(transition))

    expect(result.current).toBe(instant)
    expect(result.current).toEqual({ duration: 0 })
  })

  it('re-evaluates when the reduced motion preference changes between renders', () => {
    useReducedMotion.mockReturnValue(false)
    const transition = { duration: 0.4 }

    const { result, rerender } = renderHook(() => useReducedTransition(transition))
    expect(result.current).toBe(transition)

    useReducedMotion.mockReturnValue(true)
    rerender()

    expect(result.current).toBe(instant)
  })
})
