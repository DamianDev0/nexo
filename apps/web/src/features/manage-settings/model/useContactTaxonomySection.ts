'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import settingsService from '@/shared/api/services/settings.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { AUTOSAVE_DEBOUNCE_MS, TAXONOMY_STALE_MS } from '../config/autosave.constants'
import {
  appendOption,
  patchOption,
  removeOption,
  reorderOptions,
  type TaxonomyKind,
} from '../lib/taxonomy-edit'

import type { TaxonomyOptionPatch } from './types'
import type { ContactTaxonomy, TaxonomyOption } from '@repo/shared-types'

export function useContactTaxonomySection() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<ContactTaxonomy | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<ContactTaxonomy | null>(null)
  const latestSave = useRef(0)

  const { data, isPending: isLoading } = useQuery({
    queryKey: QUERY_KEYS.settings.contactTaxonomy,
    queryFn: settingsService.getContactTaxonomy,
    staleTime: TAXONOMY_STALE_MS,
  })

  const taxonomy = draft ?? data ?? null

  const mutation = useMutation({
    mutationFn: settingsService.updateContactTaxonomy,
    onMutate: () => {
      latestSave.current += 1
      return { save: latestSave.current }
    },
    onSuccess: (saved, _input, context) => {
      if (context.save !== latestSave.current) return
      queryClient.setQueryData(QUERY_KEYS.settings.contactTaxonomy, saved)
      if (!timer.current) setDraft(null)
    },
    onError: (error: { message?: string }, _input, context) => {
      if (context && context.save !== latestSave.current) return
      notifySaveFailed(error)
      setDraft(null)
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.contactTaxonomy })
    },
  })

  const { mutate } = mutation

  const scheduleSave = useCallback(
    (next: ContactTaxonomy) => {
      pending.current = next
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        timer.current = null
        pending.current = null
        mutate(next)
      }, AUTOSAVE_DEBOUNCE_MS)
    },
    [mutate],
  )

  useEffect(
    () => () => {
      if (!timer.current) return
      clearTimeout(timer.current)
      if (pending.current) mutate(pending.current)
    },
    [mutate],
  )

  const edit = useCallback(
    (kind: TaxonomyKind, apply: (options: ReadonlyArray<TaxonomyOption>) => TaxonomyOption[]) => {
      const base = draft ?? data
      if (!base) return
      const next = { ...base, [kind]: apply(base[kind]) }
      setDraft(next)
      scheduleSave(next)
    },
    [data, draft, scheduleSave],
  )

  const handleAdd = useCallback(
    (kind: TaxonomyKind, label: string, description?: string) =>
      edit(kind, (options) => appendOption(options, label, description)),
    [edit],
  )

  const handlePatch = useCallback(
    (kind: TaxonomyKind, key: string, patch: TaxonomyOptionPatch) =>
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

  const { isPending } = mutation

  return useMemo(
    () => ({ taxonomy, isLoading, handleAdd, handlePatch, handleRemove, handleReorder, isPending }),
    [taxonomy, isLoading, handleAdd, handlePatch, handleRemove, handleReorder, isPending],
  )
}
