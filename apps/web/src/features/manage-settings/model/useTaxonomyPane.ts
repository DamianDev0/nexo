'use client'

import { useCallback, useMemo, useState } from 'react'

import { useDndReorder } from '@/features/setup-workspace'

import { useManageSettings } from './settings-context'

import type { TaxonomyRowActions } from './types'
import type { TaxonomyKind } from '../lib/taxonomy-edit'

export function useTaxonomyPane(kind: TaxonomyKind) {
  const { contacts } = useManageSettings()
  const [newLabel, setNewLabel] = useState('')
  const dnd = useDndReorder((fromKey, toKey) => contacts.handleReorder(kind, fromKey, toKey))

  const actions: TaxonomyRowActions = useMemo(
    () => ({
      onPatch: (key, patch) => contacts.handlePatch(kind, key, patch),
      onRemove: (key) => contacts.handleRemove(kind, key),
    }),
    [contacts, kind],
  )

  const handleAdd = useCallback(() => {
    const label = newLabel.trim()
    if (!label) return
    contacts.handleAdd(kind, label)
    setNewLabel('')
  }, [contacts, kind, newLabel])

  return {
    namespace: kind === 'statuses' ? ('status' as const) : ('source' as const),
    options: contacts.taxonomy?.[kind] ?? [],
    dnd,
    actions,
    newLabel,
    setNewLabel,
    handleAdd,
  }
}

export type TaxonomyPaneModel = ReturnType<typeof useTaxonomyPane>
