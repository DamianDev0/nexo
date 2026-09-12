'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

import { PANEL_PARAM, panelQueryString, parsePanelParam, toPanelId } from '../lib/panel-route'

export function usePanelRoute() {
  const pathname = usePathname()
  const params = useSearchParams()
  const urlPanel = parsePanelParam(params.get(PANEL_PARAM))

  const [panel, setPanel] = useState(urlPanel)
  const [synced, setSynced] = useState(urlPanel)

  if (synced !== urlPanel) {
    setSynced(urlPanel)
    setPanel(urlPanel)
  }

  const onPanelChange = useCallback(
    (next: string | null) => {
      const target = toPanelId(next)
      setPanel(target)
      setSynced(target)
      window.history.replaceState(null, '', `${pathname}${panelQueryString(params, target)}`)
    },
    [pathname, params],
  )

  return { panel, onPanelChange }
}
