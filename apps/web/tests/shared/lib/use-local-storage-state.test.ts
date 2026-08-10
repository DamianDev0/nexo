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

  it('resets to the fallback value when a later corrupted read follows a valid one', () => {
    store.set('k1', JSON.stringify(['valid']))
    store.set('k2', '{not json')

    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useLocalStorageState<string[]>(key, ['fallback']),
      { initialProps: { key: 'k1' } },
    )

    expect(result.current[0]).toEqual(['valid'])

    rerender({ key: 'k2' })

    expect(result.current[0]).toEqual(['fallback'])
  })

  it('keeps the fallback value untouched when nothing is stored yet', () => {
    const { result } = renderHook(() => useLocalStorageState<string[]>('missing-key', ['fallback']))

    expect(result.current[0]).toEqual(['fallback'])
  })

  it('writes updates to the current key after the key changes', () => {
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useLocalStorageState<string[]>(key, []),
      { initialProps: { key: 'a' } },
    )

    rerender({ key: 'b' })

    act(() => result.current[1](['updated']))

    expect(store.get('b')).toBe(JSON.stringify(['updated']))
    expect(store.has('a')).toBe(false)
  })

  it('does not throw when the storage write fails, keeping the optimistic state', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: () => {
          throw new Error('quota exceeded')
        },
        removeItem: (key: string) => store.delete(key),
      },
    })

    const { result } = renderHook(() => useLocalStorageState<string[]>('k', []))

    expect(() => act(() => result.current[1](['updated']))).not.toThrow()
    expect(result.current[0]).toEqual(['updated'])
  })
})
