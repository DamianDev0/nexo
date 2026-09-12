import { DEFAULT_DETAIL_PANEL, DETAIL_PANELS } from '../config/detail-panels.constants'

import type { DetailPanelId } from '../config/detail-panels.constants'

export const PANEL_PARAM = 'panel'
export const CLOSED_PANEL = 'none'

function isPanelId(value: string | null): value is DetailPanelId {
  return DETAIL_PANELS.some((panel) => panel === value)
}

export function parsePanelParam(value: string | null): DetailPanelId | null {
  if (value === CLOSED_PANEL) return null
  return isPanelId(value) ? value : DEFAULT_DETAIL_PANEL
}

export function toPanelId(value: string | null): DetailPanelId | null {
  return isPanelId(value) ? value : null
}

export function panelQueryString(
  params: Pick<URLSearchParams, 'toString'>,
  panel: DetailPanelId | null,
): string {
  const next = new URLSearchParams(params.toString())

  if (panel === null) next.set(PANEL_PARAM, CLOSED_PANEL)
  else if (panel === DEFAULT_DETAIL_PANEL) next.delete(PANEL_PARAM)
  else next.set(PANEL_PARAM, panel)

  const query = next.toString()
  return query ? `?${query}` : ''
}
