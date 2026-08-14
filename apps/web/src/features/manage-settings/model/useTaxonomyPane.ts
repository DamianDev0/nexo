'use client'

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { COMPACT_PAGE_SIZE } from '@/shared/config/pagination'
import { useDndReorder } from '@/shared/lib/hooks/useDndReorder'

import { TAXONOMY_REASSIGN_KIND } from '../config/taxonomy.constants'
import { pageCount, pageWindow } from '../lib/paginate'
import { optionCandidates } from '../lib/reassign-candidates'
import { optionLabel, taxonomyNamespace } from '../lib/taxonomy-edit'
import { useTaxonomyUsage } from '../query/useTaxonomyUsage'

import { useManageSettings } from './settings-context'
import { useOptionPaneState } from './useOptionPaneState'
import { useReassignFlow } from './useReassignFlow'

import type { OptionFormValues, TaxonomyRowActions } from './types'
import type { TaxonomyKind } from '../lib/taxonomy-edit'
import type { TaxonomyOption } from '@repo/shared-types'

export function useTaxonomyPane(kind: TaxonomyKind) {
  const { t } = useTranslation()
  const { contacts } = useManageSettings()
  const {
    page,
    setPage,
    clampPage,
    editingKey,
    editorOpen,
    setEditorOpen,
    openCreate,
    openEdit,
    removingKey,
    openRemove,
    closeRemove,
  } = useOptionPaneState()

  const dnd = useDndReorder((fromKey, toKey) => contacts.handleReorder(kind, fromKey, toKey))
  const counts = useTaxonomyUsage()[kind]

  const namespace = taxonomyNamespace(kind)
  const taxonomy = contacts.taxonomy
  const options = useMemo(() => taxonomy?.[kind] ?? [], [kind, taxonomy])

  const totalPages = pageCount(options.length, COMPACT_PAGE_SIZE)
  clampPage(totalPages)

  const label = useCallback(
    (option: TaxonomyOption) => optionLabel(t, namespace, option),
    [namespace, t],
  )

  const editingOption = options.find((option) => option.key === editingKey) ?? null
  const removingOption = options.find((option) => option.key === removingKey) ?? null

  const actions: TaxonomyRowActions = useMemo(
    () => ({
      onPatch: (key, patch) => contacts.handlePatch(kind, key, patch),
      onEdit: openEdit,
      onRemove: (key) => {
        if ((counts[key] ?? 0) > 0) openRemove(key)
        else contacts.handleRemove(kind, key)
      },
    }),
    [contacts, counts, kind, openEdit, openRemove],
  )

  const onReassigned = useCallback(() => {
    if (removingKey) contacts.handleRemove(kind, removingKey)
    closeRemove()
  }, [closeRemove, contacts, kind, removingKey])

  const reassign = useReassignFlow({
    kind: TAXONOMY_REASSIGN_KIND[kind],
    fromKey: removingKey,
    onReassigned,
  })

  const onSubmit = useCallback(
    (values: OptionFormValues) => {
      if (editingKey) {
        contacts.handlePatch(kind, editingKey, {
          label: values.name,
          description: values.description || null,
        })
        return
      }
      contacts.handleAdd(kind, values.name, values.description)
      setPage(pageCount(options.length + 1, COMPACT_PAGE_SIZE))
    },
    [contacts, editingKey, kind, options.length, setPage],
  )

  const editingLabel = editingOption ? label(editingOption) : null
  const editingDescription = editingOption?.description ?? ''
  const editing = useMemo(
    () => (editingLabel === null ? null : { name: editingLabel, description: editingDescription }),
    [editingDescription, editingLabel],
  )

  return {
    namespace,
    options: pageWindow(options, page, COMPACT_PAGE_SIZE),
    optionLabel: label,
    counts,
    isLoading: contacts.isLoading,
    dnd,
    actions,
    pagination: { page, totalPages, onPageChange: setPage },
    editor: { open: editorOpen, editing, onOpenChange: setEditorOpen, openCreate, onSubmit },
    removal: removingOption
      ? {
          source: { label: label(removingOption), count: counts[removingOption.key] ?? 0 },
          candidates: optionCandidates(options, removingOption.key, label),
          isPending: reassign.isPending,
          cancel: closeRemove,
          confirm: reassign.confirm,
        }
      : null,
  }
}
