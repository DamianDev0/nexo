'use client'

import { useCallback, useMemo, useState } from 'react'

import { useObjectDescriptor } from '@/entities/object-descriptor'
import { buildTagOptions, toggleName, useTagCatalog } from '@/entities/tag'
import { useAssignRecordTags } from '@/features/edit-record-field'

export function useTagPicker(
  record: { readonly id: string; readonly tags: readonly string[] },
  onDone: () => void,
) {
  const catalog = useTagCatalog(useObjectDescriptor().type)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(record.tags))
  const [syncedTags, setSyncedTags] = useState(record.tags)
  const assignTags = useAssignRecordTags()

  if (syncedTags !== record.tags) {
    setSyncedTags(record.tags)
    setSelected(new Set(record.tags))
  }

  const toggle = useCallback(
    (name: string) => setSelected((current) => toggleName(current, name)),
    [],
  )

  const options = useMemo(
    () => buildTagOptions({ catalog, names: record.tags, selected, query }),
    [catalog, record.tags, selected, query],
  )

  const isDirty = useMemo(() => {
    if (selected.size !== record.tags.length) return true
    return record.tags.some((name) => !selected.has(name))
  }, [selected, record.tags])

  const save = useCallback(() => {
    assignTags({ id: record.id, tags: [...selected] })
    onDone()
  }, [assignTags, record.id, selected, onDone])

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
