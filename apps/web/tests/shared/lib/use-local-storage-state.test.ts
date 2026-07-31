import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useLocalStorageState } from '@/shared/lib/hooks/useLocalStorageState'

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

describe('useLocalStorageState', () => {
  it('starts from the initial value and persists updates', () => {
    const { result } = renderHook(() => useLocalStorageState<string[] | null>('k', null))

    expect(result.current[0]).toBeNull()

    act(() => result.current[1](['b', 'a']))

    expect(result.current[0]).toEqual(['b', 'a'])
    expect(JSON.parse(store.get('k') ?? '')).toEqual(['b', 'a'])
  })

  it('rehydrates from storage on mount', () => {
    store.set('k', JSON.stringify(['x']))

    const { result } = renderHook(() => useLocalStorageState<string[] | null>('k', null))

    expect(result.current[0]).toEqual(['x'])
  })

  it('survives corrupted storage content', () => {
    store.set('k', '{not json')

    const { result } = renderHook(() => useLocalStorageState('k', 'fallback'))

    expect(result.current[0]).toBe('fallback')
  })
})
