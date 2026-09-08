import { tenantRef } from '@/shared/api/tenant-ref'

import type { CallLogEntry } from '../model/types/call.types'

type KeyValueStorage = {
  readonly getItem: (name: string) => string | null
  readonly setItem: (name: string, value: string) => void
  readonly removeItem: (name: string) => void
}

const LEGACY_KEY = 'nexo-call-log'

const noopStorage: KeyValueStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

function scopedKey(name: string): string | null {
  const slug = tenantRef.get()
  return slug === null ? null : `${name}:${slug}`
}

export function tenantScopedStorage(): KeyValueStorage {
  try {
    const storage = typeof window === 'undefined' ? null : window.localStorage
    if (typeof storage?.setItem !== 'function') return noopStorage
    storage.removeItem(LEGACY_KEY)
    return {
      getItem: (name) => {
        const key = scopedKey(name)
        return key === null ? null : storage.getItem(key)
      },
      setItem: (name, value) => {
        const key = scopedKey(name)
        if (key !== null) storage.setItem(key, value)
      },
      removeItem: (name) => {
        const key = scopedKey(name)
        if (key !== null) storage.removeItem(key)
      },
    }
  } catch {
    return noopStorage
  }
}

export function callLogEntry(
  number: string,
  name: string | null,
  startedAt: number | null,
): CallLogEntry {
  return {
    id: crypto.randomUUID(),
    number,
    name,
    at: Date.now(),
    durationSec: startedAt === null ? 0 : Math.round((Date.now() - startedAt) / 1000),
    outcome: startedAt === null ? 'canceled' : 'completed',
  }
}
