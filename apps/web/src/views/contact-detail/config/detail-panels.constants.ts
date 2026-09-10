export const DETAIL_PANELS = ['notes', 'tasks', 'meetings'] as const

export type DetailPanelId = (typeof DETAIL_PANELS)[number]

export const DEFAULT_DETAIL_PANEL: DetailPanelId = 'notes'

export const DETAIL_TABS = ['details', 'activity'] as const

export type DetailTabId = (typeof DETAIL_TABS)[number]
