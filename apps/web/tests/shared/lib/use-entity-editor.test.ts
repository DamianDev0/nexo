import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useEntityEditor } from '@/shared/lib/hooks/useEntityEditor'

describe('useEntityEditor', () => {
  it('starts closed with nothing being edited', () => {
    const { result } = renderHook(() => useEntityEditor<string>())

    expect(result.current.open).toBe(false)
    expect(result.current.editing).toBeNull()
  })

  it('opens in create mode without an entity', () => {
    const { result } = renderHook(() => useEntityEditor<string>())

    act(() => result.current.openEdit('vip'))
    act(() => result.current.openCreate())

    expect(result.current.open).toBe(true)
    expect(result.current.editing).toBeNull()
  })

  it('opens in edit mode carrying the entity', () => {
    const { result } = renderHook(() => useEntityEditor<{ id: string }>())
    const entity = { id: 'c-1' }

    act(() => result.current.openEdit(entity))

    expect(result.current.open).toBe(true)
    expect(result.current.editing).toBe(entity)
  })

  it('keeps the entity when the panel closes so the exit animation can read it', () => {
    const { result } = renderHook(() => useEntityEditor<string>())

    act(() => result.current.openEdit('vip'))
    act(() => result.current.setOpen(false))

    expect(result.current.open).toBe(false)
    expect(result.current.editing).toBe('vip')
  })
})
