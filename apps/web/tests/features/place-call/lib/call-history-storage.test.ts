import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { callLogEntry, tenantScopedStorage } from '@/features/place-call/lib/call-history-storage'
import { tenantRef } from '@/shared/api/tenant-ref'

describe('tenantScopedStorage', () => {
  const bucket = new Map<string, string>()

  beforeEach(() => {
    bucket.clear()
    bucket.set('nexo-call-log', 'legacy')
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => bucket.get(key) ?? null,
        setItem: (key: string, value: string) => void bucket.set(key, value),
        removeItem: (key: string) => void bucket.delete(key),
      },
    })
  })

  afterEach(() => {
    tenantRef.set(null)
  })

  it('namespaces keys by the current tenant and drops the legacy key', () => {
    tenantRef.set('acme')
    const storage = tenantScopedStorage()

    storage.setItem('log', '[1]')
    expect(bucket.get('log:acme')).toBe('[1]')
    expect(bucket.has('nexo-call-log')).toBe(false)
    expect(storage.getItem('log')).toBe('[1]')

    storage.removeItem('log')
    expect(bucket.has('log:acme')).toBe(false)
  })

  it('reads and writes nothing without a tenant', () => {
    const storage = tenantScopedStorage()
    storage.setItem('log', '[1]')
    expect(storage.getItem('log')).toBeNull()
    expect([...bucket.keys()].some((key) => key.startsWith('log'))).toBe(false)
  })

  it('falls back to a no-op storage when localStorage is unusable', () => {
    Object.defineProperty(window, 'localStorage', { configurable: true, value: undefined })
    const storage = tenantScopedStorage()
    expect(() => storage.setItem('log', '1')).not.toThrow()
    expect(storage.getItem('log')).toBeNull()
  })
})

describe('callLogEntry', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('marks a never-connected call as canceled with zero duration', () => {
    expect(callLogEntry('300', null, null)).toMatchObject({ outcome: 'canceled', durationSec: 0 })
  })

  it('rounds the connected duration to whole seconds', () => {
    vi.setSystemTime(10_000)
    expect(callLogEntry('300', 'Ana', 10_000 - 4_400)).toMatchObject({
      outcome: 'completed',
      durationSec: 4,
      name: 'Ana',
    })
  })
})
