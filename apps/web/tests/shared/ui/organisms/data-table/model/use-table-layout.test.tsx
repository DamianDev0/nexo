import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { DataTableLayout } from '@/shared/ui/organisms/data-table'

import { useTableLayout } from '@/shared/ui/organisms/data-table/model/use-table-layout'

const COLUMNS = ['select', 'name', 'status', 'city']

function setup(value: DataTableLayout = {}) {
  const onChange = vi.fn()
  const view = renderHook(({ ids }) => useTableLayout(ids, { value, onChange }), {
    initialProps: { ids: COLUMNS },
  })
  return { ...view, onChange }
}

describe('useTableLayout', () => {
  it('emits the full layout when a column is resized', () => {
    const { result, onChange } = setup()

    act(() => result.current.onColumnSizingChange({ name: 260 }))

    expect(result.current.state.sizing).toEqual({ name: 260 })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ widths: { name: 260 }, density: 'comfortable' }),
    )
  })

  it('emits hidden columns when visibility is toggled off', () => {
    const { result, onChange } = setup()

    act(() => result.current.onColumnVisibilityChange({ city: false }))

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hidden: ['city'] }))
  })

  it('emits the new order after a drag and keeps pinning consistent with it', () => {
    const { result, onChange } = setup({ pinnedLeft: ['name'] })

    act(() => result.current.reorder('city', 'status'))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ order: ['name', 'city', 'status'] }),
    )
    expect(result.current.state.pinning.left).toEqual(['select', 'name'])
  })

  it('pins a column dragged onto one that is already pinned', () => {
    const { result } = setup({ pinnedLeft: ['name'] })

    act(() => result.current.reorder('city', 'name'))

    expect(result.current.state.pinning.left).toEqual(['select', 'city', 'name'])
  })

  it('unpins a column dragged out of the pinned run', () => {
    const { result } = setup({ pinnedLeft: ['name', 'status'] })

    act(() => result.current.reorder('name', 'city'))

    expect(result.current.state.pinning.left).toEqual(['select', 'status'])
  })

  it('unpins exactly one column and leaves the rest alone', () => {
    const { result } = setup({ pinnedLeft: ['name', 'status'] })

    act(() => result.current.onColumnPinningChange({ left: ['select', 'status'], right: [] }))

    expect(result.current.state.pinning.left).toEqual(['select', 'status'])
    expect(result.current.state.order).toEqual(COLUMNS)
  })

  it('moves a freshly pinned column next to the pins it joins', () => {
    const { result } = setup({ pinnedLeft: ['name'] })

    act(() => result.current.onColumnPinningChange({ left: ['select', 'name', 'city'], right: [] }))

    expect(result.current.state.order).toEqual(['select', 'name', 'city', 'status'])
    expect(result.current.state.pinning.left).toEqual(['select', 'name', 'city'])
  })

  it('does not emit when a drag lands on the column it started from', () => {
    const { result, onChange } = setup()

    act(() => result.current.reorder('name', 'name'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('emits the density change', () => {
    const { result, onChange } = setup()

    act(() => result.current.setDensity('compact'))

    expect(result.current.state.density).toBe('compact')
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ density: 'compact' }))
  })

  it('reseeds from the incoming layout when the column set changes', () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ ids, value }) => useTableLayout(ids, { value, onChange }),
      { initialProps: { ids: [] as string[], value: {} as DataTableLayout } },
    )

    expect(result.current.state.order).toEqual([])

    rerender({ ids: COLUMNS, value: { hidden: ['city'], density: 'compact' } })

    expect(result.current.state.order).toEqual(COLUMNS)
    expect(result.current.state.visibility).toEqual({ city: false })
    expect(result.current.state.density).toBe('compact')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('works without a binding so the table stays usable unpersisted', () => {
    const { result } = renderHook(() => useTableLayout(COLUMNS, undefined))

    act(() => result.current.setDensity('compact'))

    expect(result.current.state.density).toBe('compact')
  })
})
