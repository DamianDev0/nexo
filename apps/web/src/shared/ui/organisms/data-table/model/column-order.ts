'use client'

import { useCallback, useEffect, useState } from 'react'

import { DATA_TABLE_STORAGE_PREFIX } from '../config/table.constants'

import type { ColumnOrderState, OnChangeFn } from '@tanstack/react-table'

function slotFor(key: string): string {
  return `${DATA_TABLE_STORAGE_PREFIX}columnOrder.v1:${key}`
}

function reconcile(stored: ReadonlyArray<string>, current: ReadonlyArray<string>): string[] {
  const valid = new Set(current)
  const kept = stored.filter((id) => valid.has(id))
  const known = new Set(kept)
  return [...kept, ...current.filter((id) => !known.has(id))]
}

function read(key: string): string[] | null {
  try {
    const raw = window.localStorage.getItem(slotFor(key))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : null
  } catch {
    return null
  }
}

function write(key: string, order: ReadonlyArray<string>): void {
  try {
    window.localStorage.setItem(slotFor(key), JSON.stringify(order))
  } catch {
    return
  }
}

export function useColumnOrder(columnIds: ReadonlyArray<string>, storageKey?: string) {
  const [columnOrder, setColumnOrder] = useState<string[]>(() => [...columnIds])

  useEffect(() => {
    if (!storageKey) return
    const stored = read(storageKey)
    setColumnOrder(stored ? reconcile(stored, columnIds) : [...columnIds])
  }, [storageKey, columnIds])

  const persist = useCallback(
    (next: string[]) => {
      if (storageKey) write(storageKey, next)
      return next
    },
    [storageKey],
  )

  const onColumnOrderChange: OnChangeFn<ColumnOrderState> = useCallback(
    (updater) =>
      setColumnOrder((prev) =>
        persist(typeof updater === 'function' ? updater(prev) : [...updater]),
      ),
    [persist],
  )

  const reorder = useCallback(
    (activeId: string, overId: string) =>
      setColumnOrder((prev) => {
        const from = prev.indexOf(activeId)
        const to = prev.indexOf(overId)
        if (from < 0 || to < 0 || from === to) return prev
        const next = [...prev]
        const [moved] = next.splice(from, 1)
        if (!moved) return prev
        next.splice(to, 0, moved)
        return persist(next)
      }),
    [persist],
  )

  return { columnOrder, onColumnOrderChange, reorder }
}
