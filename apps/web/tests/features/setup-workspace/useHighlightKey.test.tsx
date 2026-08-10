import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useHighlightKey } from '@/features/setup-workspace/model/useHighlightKey'

describe('useHighlightKey', () => {
  it('starts with no highlighted key', () => {
    const { result } = renderHook(() => useHighlightKey())

    expect(result.current.key).toBeNull()
  })

  it('sets the key on highlight', () => {
    const { result } = renderHook(() => useHighlightKey())

    act(() => result.current.highlight('accent'))

    expect(result.current.key).toBe('accent')
  })

  it('resets to null on clear', () => {
    const { result } = renderHook(() => useHighlightKey())

    act(() => result.current.highlight('accent'))
    act(() => result.current.clear())

    expect(result.current.key).toBeNull()
  })
})
