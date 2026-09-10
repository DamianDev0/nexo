'use client'

import { useCallback, useMemo, useState } from 'react'

type RecordLayoutOptions = {
  readonly defaultPanel?: string | null
  readonly onPanelChange?: (panelId: string | null) => void
}

export function useRecordLayout({ defaultPanel = null, onPanelChange }: RecordLayoutOptions = {}) {
  const [activePanel, setActivePanel] = useState<string | null>(defaultPanel)

  const openPanel = useCallback(
    (panelId: string | null) => {
      setActivePanel(panelId)
      onPanelChange?.(panelId)
    },
    [onPanelChange],
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
