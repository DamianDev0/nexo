'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import {
  appendOption,
  patchOption,
  removeOption,
  reorderOptions,
  type TaxonomyKind,
} from '../lib/taxonomy-edit'

import type { ContactTaxonomy, TaxonomyOption } from '@repo/shared-types'

export function useContactTaxonomySection(onSaved: () => void) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<ContactTaxonomy | null>(null)

  const { data } = useQuery({
    queryKey: QUERY_KEYS.settings.contactTaxonomy,
    queryFn: settingsService.getContactTaxonomy,
  })

  const taxonomy = draft ?? data ?? null

  const mutation = useMutation({
    mutationFn: settingsService.updateContactTaxonomy,
    onSuccess: (saved) => {
      queryClient.setQueryData(QUERY_KEYS.settings.contactTaxonomy, saved)
      setDraft(null)
      onSaved()
    },
  })

  const edit = useCallback(
    (kind: TaxonomyKind, apply: (options: ReadonlyArray<TaxonomyOption>) => TaxonomyOption[]) => {
      setDraft((current) => {
        const base = current ?? data
        if (!base) return current
        return { ...base, [kind]: apply(base[kind]) }
      })
    },
    [data],
  )

  const handleAdd = useCallback(
    (kind: TaxonomyKind, label: string) => edit(kind, (options) => appendOption(options, label)),
    [edit],
  )

  const handlePatch = useCallback(
    (kind: TaxonomyKind, key: string, patch: Partial<Pick<TaxonomyOption, 'label' | 'color'>>) =>
      edit(kind, (options) => patchOption(options, key, patch)),
    [edit],
  )

  const handleRemove = useCallback(
    (kind: TaxonomyKind, key: string) => edit(kind, (options) => removeOption(options, key)),
    [edit],
  )

  const handleReorder = useCallback(
    (kind: TaxonomyKind, fromKey: string, toKey: string) =>
      edit(kind, (options) => reorderOptions(options, fromKey, toKey)),
    [edit],
  )

  const handleSave = useCallback(() => {
    if (draft) mutation.mutate(draft)
  }, [draft, mutation])

  const handleReset = useCallback(() => setDraft(null), [])

  return {
    taxonomy,
    handleAdd,
    handlePatch,
    handleRemove,
    handleReorder,
    handleSave,
    handleReset,
    isDirty: draft !== null && JSON.stringify(draft) !== JSON.stringify(data),
    isPending: mutation.isPending,
  }
}
