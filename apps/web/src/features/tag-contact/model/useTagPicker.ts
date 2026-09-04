'use client'

import { useCallback, useMemo, useState } from 'react'

import { useTagCatalog } from '@/entities/tag'

import { useAssignContactTags } from '../query/useAssignContactTags'

import type { Tag } from '@repo/shared-types'

export type TagOption = {
  readonly name: string
  readonly color: string | null
  readonly description: string | null
  readonly selected: boolean
}

type TagMeta = { readonly color: string | null; readonly description: string | null }

function buildOptions(
  catalog: ReadonlyMap<string, Tag>,
  contactTags: readonly string[],
  selected: ReadonlySet<string>,
  query: string,
): readonly TagOption[] {
  const byName = new Map<string, TagMeta>()
  for (const tag of catalog.values()) {
    byName.set(tag.name, { color: tag.color, description: tag.description })
  }
  for (const name of contactTags) {
    if (!byName.has(name)) byName.set(name, { color: null, description: null })
  }
  const q = query.trim().toLowerCase()
  return [...byName.entries()]
    .filter(([name]) => q === '' || name.toLowerCase().includes(q))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, meta]) => ({ name, ...meta, selected: selected.has(name) }))
}

export function useTagPicker(
  contact: { readonly id: string; readonly tags: readonly string[] },
  onDone: () => void,
) {
  const catalog = useTagCatalog('contact')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(contact.tags))
  const { mutate, isPending } = useAssignContactTags()

  const toggle = useCallback((name: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  const options = useMemo(
    () => buildOptions(catalog, contact.tags, selected, query),
    [catalog, contact.tags, selected, query],
  )

  const isDirty = useMemo(() => {
    if (selected.size !== contact.tags.length) return true
    return contact.tags.some((name) => !selected.has(name))
  }, [selected, contact.tags])

  const save = useCallback(() => {
    mutate({ id: contact.id, tags: [...selected] }, { onSuccess: onDone })
  }, [mutate, contact.id, selected, onDone])

  return {
    query,
    setQuery,
    options,
    toggle,
    selectedCount: selected.size,
    isDirty,
    save,
    isPending,
  }
}
