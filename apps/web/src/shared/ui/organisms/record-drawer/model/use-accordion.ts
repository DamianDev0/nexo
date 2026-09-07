'use client'

import { useCallback, useMemo, useState } from 'react'

function readStored(storageKey: string): ReadonlySet<string> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.filter((id) => typeof id === 'string')) : null
  } catch {
    return null
  }
}

function writeStored(storageKey: string, ids: ReadonlySet<string>): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...ids]))
  } catch {
    return
  }
}

type AccordionOptions = {
  readonly defaultOpen?: readonly string[]
  readonly storageKey?: string
}

export function useAccordion({ defaultOpen = [], storageKey }: AccordionOptions = {}) {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(
    () => (storageKey ? readStored(storageKey) : null) ?? new Set(defaultOpen),
  )

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(openIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setOpenIds(next)
      if (storageKey) writeStored(storageKey, next)
    },
    [openIds, storageKey],
  )

  const isOpen = useCallback((id: string) => openIds.has(id), [openIds])

  return useMemo(() => ({ isOpen, toggle }), [isOpen, toggle])
}

export type Accordion = ReturnType<typeof useAccordion>
