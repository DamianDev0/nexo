'use client'

import { useCallback } from 'react'

import { SMART_LIST_TAB_SELECTOR } from '../config/smart-list.constants'

import type { KeyboardEvent } from 'react'

function nextIndex(key: string, current: number, total: number): number | null {
  if (key === 'ArrowRight') return Math.min(current + 1, total - 1)
  if (key === 'ArrowLeft') return Math.max(current - 1, 0)
  if (key === 'Home') return 0
  if (key === 'End') return total - 1
  return null
}

export function useSmartListNavigation(
  ids: ReadonlyArray<string>,
  activeId: string,
  onSelect: (id: string) => void,
) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const target = nextIndex(event.key, ids.indexOf(activeId), ids.length)
      if (target === null) return

      const id = ids[target]
      if (id === undefined || id === activeId) return

      event.preventDefault()
      onSelect(id)
      event.currentTarget
        .closest('[role="tablist"]')
        ?.querySelector<HTMLElement>(`[${SMART_LIST_TAB_SELECTOR}="${id}"] [role="tab"]`)
        ?.focus()
    },
    [activeId, ids, onSelect],
  )
}
