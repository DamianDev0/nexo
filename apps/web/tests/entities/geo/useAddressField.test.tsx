import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { KeyboardEvent } from 'react'

import { useAddressField } from '@/entities/geo/model/useAddressField'

vi.mock('@/entities/geo/query/useAddressAutocomplete', () => ({
  useAddressAutocomplete: () => ({ places: [], isSearching: false }),
}))

function keyEvent(key: string): KeyboardEvent<HTMLInputElement> {
  return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement>
}

describe('useAddressField', () => {
  it('opens the panel on focus and typing, closes on blur with normalization', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useAddressField({ value: 'calle 10', onChange }))

    act(() => result.current.actions.onFocus())
    expect(result.current.state.open).toBe(true)

    act(() => result.current.actions.onBlur())
    expect(result.current.state.open).toBe(false)
    expect(onChange).toHaveBeenCalledWith(expect.any(String))
  })

  it('builds via suggestions from the current value while open', () => {
    const { result } = renderHook(() => useAddressField({ value: 'c', onChange: vi.fn() }))

    act(() => result.current.actions.onFocus())
    expect(result.current.state.options.length).toBeGreaterThan(0)
  })

  it('moves the active index with the keyboard and resets it when options change', () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(({ value }) => useAddressField({ value, onChange }), {
      initialProps: { value: 'c' },
    })

    act(() => result.current.actions.onFocus())
    act(() => result.current.actions.onKeyDown(keyEvent('ArrowDown')))
    expect(result.current.state.activeIndex).toBe(0)

    rerender({ value: 'calle 45 # 10' })
    expect(result.current.state.activeIndex).toBe(-1)
  })

  it('appends a trailing space when selecting a via option', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useAddressField({ value: 'c', onChange }))

    act(() => result.current.actions.onFocus())
    const via = result.current.state.options.find((option) => option.kind === 'via')
    expect(via).toBeDefined()

    if (via) act(() => result.current.actions.onSelect(via))
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/ $/))
    expect(result.current.state.open).toBe(true)
  })

  it('notifies place selection and closes the panel', () => {
    const onChange = vi.fn()
    const onPlaceSelect = vi.fn()
    const { result } = renderHook(() =>
      useAddressField({ value: 'calle 10', onChange, onPlaceSelect }),
    )

    act(() => result.current.actions.onFocus())
    act(() =>
      result.current.actions.onSelect({
        kind: 'place',
        mainText: 'Calle 10 # 5-20',
        secondaryText: 'Bogotá',
      } as never),
    )

    expect(onChange).toHaveBeenCalledWith('Calle 10 # 5-20')
    expect(onPlaceSelect).toHaveBeenCalledWith({
      mainText: 'Calle 10 # 5-20',
      secondaryText: 'Bogotá',
    })
    expect(result.current.state.open).toBe(false)
  })
})
