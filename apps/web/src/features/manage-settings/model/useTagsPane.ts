'use client'

import { taxonomyColorAt } from '@repo/shared-types'
import { useCallback, useMemo } from 'react'

import { COMPACT_PAGE_SIZE } from '@/shared/config/pagination'

import { pageCount } from '../lib/paginate'
import { tagCandidates } from '../lib/reassign-candidates'
import { useTagsAdmin } from '../query/useTagsAdmin'
import { useTaxonomyUsage } from '../query/useTaxonomyUsage'

import { useOptionPaneState } from './useOptionPaneState'
import { useReassignFlow } from './useReassignFlow'

import type { OptionFormValues, TagRowActions } from './types'

export function useTagsPane() {
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

  const { tags, total, isPending, create, update, remove } = useTagsAdmin(page)
  const counts = useTaxonomyUsage().tags

  const totalPages = pageCount(total, COMPACT_PAGE_SIZE)
  clampPage(totalPages)

  const editingTag = tags.find((tag) => tag.id === editingKey) ?? null
  const removingTag = tags.find((tag) => tag.id === removingKey) ?? null

  const actions: TagRowActions = useMemo(
    () => ({
      onUpdate: update,
      onEdit: (tag) => openEdit(tag.id),
      onRemove: (tag) => {
        if ((counts[tag.name] ?? 0) > 0) openRemove(tag.id)
        else remove(tag)
      },
    }),
    [counts, openEdit, openRemove, remove, update],
  )

  const onReassigned = useCallback(() => {
    if (removingTag) remove(removingTag)
    closeRemove()
  }, [closeRemove, remove, removingTag])

  const reassign = useReassignFlow({
    kind: 'tag',
    fromKey: removingTag?.name ?? null,
    onReassigned,
  })

  const onSubmit = useCallback(
    (values: OptionFormValues) => {
      if (editingTag) {
        update({ id: editingTag.id, name: values.name, description: values.description })
        return
      }
      create({ name: values.name, description: values.description, color: taxonomyColorAt(total) })
    },
    [create, editingTag, total, update],
  )

  const editingName = editingTag?.name ?? null
  const editingDescription = editingTag?.description ?? ''
  const editing = useMemo(
    () => (editingName === null ? null : { name: editingName, description: editingDescription }),
    [editingDescription, editingName],
  )

  return {
    tags,
    isPending,
    actions,
    counts,
    pagination: { page, totalPages, onPageChange: setPage },
    editor: { open: editorOpen, editing, onOpenChange: setEditorOpen, openCreate, onSubmit },
    removal: removingTag
      ? {
          source: { label: removingTag.name, count: counts[removingTag.name] ?? 0 },
          candidates: tagCandidates(tags, removingTag.id),
          isPending: reassign.isPending,
          cancel: closeRemove,
          confirm: reassign.confirm,
        }
      : null,
  }
}
