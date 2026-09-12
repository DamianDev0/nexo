'use client'

import { useCallback, useMemo, useState } from 'react'

type RecordLayoutOptions = {
  readonly panel?: string | null
  readonly defaultPanel?: string | null
  readonly onPanelChange?: (panelId: string | null) => void
}

export function useRecordLayout({
  panel,
  defaultPanel = null,
  onPanelChange,
}: RecordLayoutOptions = {}) {
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultPanel)
  const controlled = panel !== undefined
  const activePanel = controlled ? panel : uncontrolled

  const openPanel = useCallback(
    (panelId: string | null) => {
      if (!controlled) setUncontrolled(panelId)
      onPanelChange?.(panelId)
    },
    [controlled, onPanelChange],
  )

  const togglePanel = useCallback(
    (panelId: string) => openPanel(activePanel === panelId ? null : panelId),
    [activePanel, openPanel],
  )

  const closePanel = useCallback(() => openPanel(null), [openPanel])

  return useMemo(
    () => ({ activePanel, openPanel, togglePanel, closePanel }),
    [activePanel, openPanel, togglePanel, closePanel],
  )
}

export type RecordLayoutState = ReturnType<typeof useRecordLayout>
