'use client'

import { useCallback, useState } from 'react'

import { FIRST_PAGE } from '@/shared/config/pagination'
import { useEntityEditor } from '@/shared/lib/hooks/useEntityEditor'

export function useOptionPaneState() {
  const [page, setPage] = useState(FIRST_PAGE)
  const [removingKey, setRemovingKey] = useState<string | null>(null)
  const editor = useEntityEditor<string>()

  const closeRemove = useCallback(() => setRemovingKey(null), [])

  const clampPage = (totalPages: number) => {
    if (page > totalPages) setPage(totalPages)
  }

  return {
    page,
    setPage,
    clampPage,
    editingKey: editor.editing,
    editorOpen: editor.open,
    setEditorOpen: editor.setOpen,
    openCreate: editor.openCreate,
    openEdit: editor.openEdit,
    removingKey,
    openRemove: setRemovingKey,
    closeRemove,
  }
}
