import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useEditableName } from '@/features/manage-settings/model/useEditableName'

describe('useEditableName', () => {
  it('starts from the current value', () => {
    const { result } = renderHook(() => useEditableName({ value: 'Pipeline', onCommit: vi.fn() }))

    expect(result.current.name).toBe('Pipeline')
  })

  it('trims whitespace and commits the trimmed value', () => {
    const onCommit = vi.fn()
    const { result } = renderHook(() => useEditableName({ value: 'Pipeline', onCommit }))

    act(() => result.current.setName('  Sales Pipeline  '))
    act(() => result.current.commit())

    expect(onCommit).toHaveBeenCalledWith('Sales Pipeline')
  })

  it('reverts to the current value without committing when the input is empty', () => {
    const onCommit = vi.fn()
    const { result } = renderHook(() => useEditableName({ value: 'Pipeline', onCommit }))

    act(() => result.current.setName('   '))
    act(() => result.current.commit())

    expect(onCommit).not.toHaveBeenCalled()
    expect(result.current.name).toBe('Pipeline')
  })

  it('commits an empty value when allowEmpty is set', () => {
    const onCommit = vi.fn()
    const { result } = renderHook(() =>
      useEditableName({ value: 'Pipeline', onCommit, allowEmpty: true }),
    )

    act(() => result.current.setName('   '))
    act(() => result.current.commit())

    expect(onCommit).toHaveBeenCalledWith('')
  })

  it('does not commit when the trimmed value is unchanged', () => {
    const onCommit = vi.fn()
    const { result } = renderHook(() => useEditableName({ value: 'Pipeline', onCommit }))

    act(() => result.current.setName('  Pipeline  '))
    act(() => result.current.commit())

    expect(onCommit).not.toHaveBeenCalled()
    expect(result.current.name).toBe('Pipeline')
  })

  it('resyncs the draft when the upstream value changes', () => {
    const onCommit = vi.fn()
    const { result, rerender } = renderHook(({ value }) => useEditableName({ value, onCommit }), {
      initialProps: { value: 'Pipeline' },
    })

    act(() => result.current.setName('Draft'))
    rerender({ value: 'Renamed upstream' })

    expect(result.current.name).toBe('Renamed upstream')
  })

  it('keeps the draft while the upstream value is unchanged', () => {
    const onCommit = vi.fn()
    const { result, rerender } = renderHook(({ value }) => useEditableName({ value, onCommit }), {
      initialProps: { value: 'Pipeline' },
    })

    act(() => result.current.setName('Draft'))
    rerender({ value: 'Pipeline' })

    expect(result.current.name).toBe('Draft')
  })
})
