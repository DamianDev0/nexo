'use client'

import { useCallback, useMemo, useState } from 'react'

import { buildTagOptions, toggleName, useTagCatalog } from '@/entities/tag'

import { useAssignContactTags } from '../query/useAssignContactTags'

export function useTagPicker(
  contact: { readonly id: string; readonly tags: readonly string[] },
  onDone: () => void,
) {
  const catalog = useTagCatalog('contact')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(contact.tags))
  const [syncedTags, setSyncedTags] = useState(contact.tags)
  const assignTags = useAssignContactTags()

  if (syncedTags !== contact.tags) {
    setSyncedTags(contact.tags)
    setSelected(new Set(contact.tags))
  }

  const toggle = useCallback(
    (name: string) => setSelected((current) => toggleName(current, name)),
    [],
  )

  const options = useMemo(
    () => buildTagOptions({ catalog, names: contact.tags, selected, query }),
    [catalog, contact.tags, selected, query],
  )

  const isDirty = useMemo(() => {
    if (selected.size !== contact.tags.length) return true
    return contact.tags.some((name) => !selected.has(name))
  }, [selected, contact.tags])

  const save = useCallback(() => {
    assignTags({ id: contact.id, tags: [...selected] })
    onDone()
  }, [assignTags, contact.id, selected, onDone])

  return {
    query,
    setQuery,
    options,
    toggle,
    selectedCount: selected.size,
    isDirty,
    save,
  }
}
