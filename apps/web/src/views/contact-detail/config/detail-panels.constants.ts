export const DETAIL_PANELS = ['activity', 'notes', 'tasks', 'meetings', 'tags'] as const

export type DetailPanelId = (typeof DETAIL_PANELS)[number]

export const DEFAULT_DETAIL_PANEL: DetailPanelId = 'activity'

export const DETAIL_TABS = ['details', 'engagement'] as const

export type DetailTabId = (typeof DETAIL_TABS)[number]

export const DETAIL_ACCORDION_KEY = 'record-layout:contact'
