import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useHydrated } from '@/shared/lib/hooks/useHydrated'

describe('useHydrated', () => {
  it('reports false on the render the server would produce', () => {
    let firstValue: boolean | null = null
    renderHook(() => {
      const value = useHydrated()
      firstValue ??= value
      return value
    })

    expect(firstValue).toBe(false)
  })

  it('reports true once the effect has run', () => {
    const { result } = renderHook(() => useHydrated())

    expect(result.current).toBe(true)
  })
})
