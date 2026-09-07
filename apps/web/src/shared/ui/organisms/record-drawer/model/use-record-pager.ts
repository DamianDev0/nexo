'use client'

import { useCallback, useMemo } from 'react'

import { SHORTCUTS } from '@/shared/config/shortcuts'
import { useHotkey } from '@/shared/lib/hooks/useHotkey'

import type { RecordPager } from '../types'

const ARROW_PREV = ['ArrowLeft'] as const
const ARROW_NEXT = ['ArrowRight'] as const

type RecordPagerOptions<T> = {
  readonly items: ReadonlyArray<T>
  readonly current: T | null
  readonly getId: (item: T) => string
  readonly onSelect: (item: T) => void
  readonly enabled?: boolean
}

export function useRecordPager<T>({
  items,
  current,
  getId,
  onSelect,
  enabled = true,
}: RecordPagerOptions<T>): RecordPager | null {
  const currentId = current === null ? null : getId(current)
  const index = currentId === null ? -1 : items.findIndex((item) => getId(item) === currentId)
  const total = items.length
  const hasPrev = index > 0
  const hasNext = index >= 0 && index < total - 1

  const prev = useCallback(() => {
    const target = items[index - 1]
    if (hasPrev && target !== undefined) onSelect(target)
  }, [items, index, hasPrev, onSelect])

  const next = useCallback(() => {
    const target = items[index + 1]
    if (hasNext && target !== undefined) onSelect(target)
  }, [items, index, hasNext, onSelect])

  const active = enabled && index >= 0
  useHotkey(SHORTCUTS.previousItem, prev, { enabled: active })
  useHotkey(SHORTCUTS.nextItem, next, { enabled: active })
  useHotkey(ARROW_PREV, prev, { enabled: active })
  useHotkey(ARROW_NEXT, next, { enabled: active })

  return useMemo(
    () => (index < 0 ? null : { index, total, hasPrev, hasNext, prev, next }),
    [index, total, hasPrev, hasNext, prev, next],
  )
}
