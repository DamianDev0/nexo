import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useEditableName } from '@/features/manage-settings/model/useEditableName'

describe('useEditableName', () => {
  it('starts from the current value', () => {
    const onCommit = vi.fn()
    const { result } = renderHook(() => useEditableName('Pipeline', onCommit))

    expect(result.current.name).toBe('Pipeline')
  })

  it('trims whitespace and commits the trimmed value', () => {
    const onCommit = vi.fn()
    const { result } = renderHook(() => useEditableName('Pipeline', onCommit))

    act(() => result.current.setName('  Sales Pipeline  '))
    act(() => result.current.commit())

    expect(onCommit).toHaveBeenCalledWith('Sales Pipeline')
  })

  it('reverts to the current value without committing when the input is empty', () => {
    const onCommit = vi.fn()
    const { result } = renderHook(() => useEditableName('Pipeline', onCommit))

    act(() => result.current.setName('   '))
    act(() => result.current.commit())

    expect(onCommit).not.toHaveBeenCalled()
    expect(result.current.name).toBe('Pipeline')
  })

  it('does not commit when the value is unchanged', () => {
    const onCommit = vi.fn()
    const { result } = renderHook(() => useEditableName('Pipeline', onCommit))

    act(() => result.current.setName('Pipeline'))
    act(() => result.current.commit())

    expect(onCommit).not.toHaveBeenCalled()
  })
})
