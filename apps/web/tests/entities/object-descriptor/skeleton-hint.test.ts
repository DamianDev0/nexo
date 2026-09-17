import { beforeEach, describe, expect, it } from 'vitest'

import { readSkeletonHint, writeSkeletonHint } from '@/entities/object-descriptor'

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  document.cookie = 'nexo_tenant=acme'
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
  it('keeps each record type under its own key', () => {
    writeSkeletonHint('companies', { widths: [40, 180], rows: 4 })

    expect(store.has('nexo:companies-skeleton:acme')).toBe(true)
    expect(readSkeletonHint('contacts')).toBeNull()
  })

  it('returns null when nothing is stored', () => {
    expect(readSkeletonHint('contacts')).toBeNull()
  })

  it('round-trips widths and rows under the tenant scope', () => {
    writeSkeletonHint('contacts', { widths: [40, 220, 150], rows: 6 })
    expect(store.has('nexo:contacts-skeleton:acme')).toBe(true)
    expect(readSkeletonHint('contacts')).toEqual({ widths: [40, 220, 150], rows: 6 })
  })

  it('does not leak hints across tenants', () => {
    writeSkeletonHint('contacts', { widths: [40, 220], rows: 5 })
    document.cookie = 'nexo_tenant=otra'
    expect(readSkeletonHint('contacts')).toBeNull()
  })

  it('clamps rows into the visible range', () => {
    writeSkeletonHint('contacts', { widths: [40], rows: 40 })
    expect(readSkeletonHint('contacts')?.rows).toBe(10)
    writeSkeletonHint('contacts', { widths: [40], rows: 1 })
    expect(readSkeletonHint('contacts')?.rows).toBe(3)
  })

  it('rejects malformed or oversized payloads', () => {
    store.set('nexo:contacts-skeleton:acme', '{"widths":["x"],"rows":5}')
    expect(readSkeletonHint('contacts')).toBeNull()
    store.set('nexo:contacts-skeleton:acme', 'not-json')
    expect(readSkeletonHint('contacts')).toBeNull()
    store.set(
      'nexo:contacts-skeleton:acme',
      JSON.stringify({ widths: Array.from({ length: 500 }, () => 40), rows: 5 }),
    )
    expect(readSkeletonHint('contacts')).toBeNull()
  })
})
