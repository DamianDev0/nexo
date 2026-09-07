import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAccordion } from '@/shared/ui/organisms/record-drawer/model/use-accordion'

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  })
})

describe('useAccordion', () => {
  it('opens the default sections and toggles the rest', () => {
    const { result } = renderHook(() => useAccordion({ defaultOpen: ['details'] }))
    expect(result.current.isOpen('details')).toBe(true)
    expect(result.current.isOpen('notes')).toBe(false)

    act(() => result.current.toggle('notes'))
    expect(result.current.isOpen('notes')).toBe(true)

    act(() => result.current.toggle('details'))
    expect(result.current.isOpen('details')).toBe(false)
  })

  it('persists the open set under the storage key', () => {
    const { result } = renderHook(() => useAccordion({ storageKey: 'drawer:test' }))
    act(() => result.current.toggle('tags'))
    expect(JSON.parse(store.get('drawer:test') ?? '[]')).toEqual(['tags'])
  })

  it('restores a stored open set over the defaults', () => {
    store.set('drawer:test', JSON.stringify(['tasks']))
    const { result } = renderHook(() =>
      useAccordion({ defaultOpen: ['details'], storageKey: 'drawer:test' }),
    )
    expect(result.current.isOpen('tasks')).toBe(true)
    expect(result.current.isOpen('details')).toBe(false)
  })

  it('ignores corrupt storage', () => {
    store.set('drawer:test', '{oops')
    const { result } = renderHook(() =>
      useAccordion({ defaultOpen: ['details'], storageKey: 'drawer:test' }),
    )
    expect(result.current.isOpen('details')).toBe(true)
  })
})
