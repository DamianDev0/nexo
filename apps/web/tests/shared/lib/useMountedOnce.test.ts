import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useMountedOnce } from '@/shared/lib/hooks/useMountedOnce'

describe('useMountedOnce', () => {
  it('stays false while inactive', () => {
    const { result } = renderHook(({ active }) => useMountedOnce(active), {
      initialProps: { active: false },
    })
    expect(result.current).toBe(false)
  })

  it('flips true on activation and never reverts', () => {
    const { result, rerender } = renderHook(({ active }) => useMountedOnce(active), {
      initialProps: { active: false },
    })
    rerender({ active: true })
    expect(result.current).toBe(true)
    rerender({ active: false })
    expect(result.current).toBe(true)
  })
})
