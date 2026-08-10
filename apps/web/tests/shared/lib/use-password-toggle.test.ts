import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { usePasswordToggle } from '@/shared/lib/hooks/usePasswordToggle'

describe('usePasswordToggle', () => {
  it('starts with the password hidden', () => {
    const { result } = renderHook(() => usePasswordToggle())

    expect(result.current.showPassword).toBe(false)
  })

  it('flips visibility on each toggle call, based on the previous state', () => {
    const { result } = renderHook(() => usePasswordToggle())

    act(() => result.current.togglePassword())
    expect(result.current.showPassword).toBe(true)

    act(() => result.current.togglePassword())
    expect(result.current.showPassword).toBe(false)

    act(() => result.current.togglePassword())
    expect(result.current.showPassword).toBe(true)
  })

  it('exposes both the flag and the toggle function', () => {
    const { result } = renderHook(() => usePasswordToggle())

    expect(typeof result.current.showPassword).toBe('boolean')
    expect(typeof result.current.togglePassword).toBe('function')
  })
})
