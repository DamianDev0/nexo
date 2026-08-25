import { beforeEach, describe, expect, it } from 'vitest'

import { readSkeletonHint, writeSkeletonHint } from '@/entities/contact'

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

describe('skeleton-hint', () => {
  it('returns null when nothing is stored', () => {
    expect(readSkeletonHint()).toBeNull()
  })

  it('round-trips widths and rows', () => {
    writeSkeletonHint({ widths: [40, 220, 150], rows: 6 })
    expect(readSkeletonHint()).toEqual({ widths: [40, 220, 150], rows: 6 })
  })

  it('clamps rows into the visible range', () => {
    writeSkeletonHint({ widths: [40], rows: 40 })
    expect(readSkeletonHint()?.rows).toBe(10)
    writeSkeletonHint({ widths: [40], rows: 1 })
    expect(readSkeletonHint()?.rows).toBe(3)
  })

  it('rejects malformed payloads', () => {
    store.set('nexo:contacts-skeleton', '{"widths":["x"],"rows":5}')
    expect(readSkeletonHint()).toBeNull()
    store.set('nexo:contacts-skeleton', 'not-json')
    expect(readSkeletonHint()).toBeNull()
  })
})
