import { PREVIEW_STATUS_LOST, PREVIEW_STATUS_WON } from '@/shared/config/tokens/effects'

import type { CSSProperties } from 'react'

export interface PreviewDensity {
  readonly px: string
  readonly py: string
  readonly gap: string
}

export const KPI_DATA = [
  { label: 'Revenue', value: '$24.5K', trend: '+12%' },
  { label: 'Contacts', value: '1,284', trend: '+8%' },
  { label: 'Deals', value: '86', trend: '+23%' },
] as const

export const TABLE_ROWS = [
  { name: 'Acme Corp', status: 'Won', value: '$12,400' },
  { name: 'TechFlow Inc', status: 'Active', value: '$8,200' },
  { name: 'DataSync Ltd', status: 'Active', value: '$4,100' },
  { name: 'CloudBase', status: 'Lost', value: '$3,600' },
] as const

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Won: PREVIEW_STATUS_WON,
  Active: { bg: 'PRIMARY_TINT', text: 'PRIMARY' },
  Lost: PREVIEW_STATUS_LOST,
}

export function statusStyle(status: string, primary: string): CSSProperties {
  const s = STATUS_STYLES[status]
  if (!s) return {}
  return {
    background: s.bg === 'PRIMARY_TINT' ? `${primary}18` : s.bg,
    color: s.text === 'PRIMARY' ? primary : s.text,
  }
}
