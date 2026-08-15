import {
  CONTACT_COLUMN_MAX_WIDTH,
  CONTACT_COLUMN_MIN_WIDTH,
  CONTACT_TABLE_MAX_COLUMNS,
  CONTACT_TABLE_MAX_PINNED,
  CONTACT_VIEW_DENSITIES,
} from '@repo/shared-types'
import type { ContactTableState, ContactViewColumns, ContactViewDensity } from '@repo/shared-types'

import { CONTACT_COLUMN_CATALOG } from '../constants/contact-columns.catalog'

const MIN_WIDTH_BY_KEY = new Map(CONTACT_COLUMN_CATALOG.map((c) => [c.key, c.minWidth]))

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function uniqueStrings(value: unknown, limit: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const kept = [...new Set(value.filter((item): item is string => typeof item === 'string'))]
  return kept.slice(0, limit)
}

function knownColumns(value: unknown, limit: number): string[] | undefined {
  return uniqueStrings(value, limit)?.filter((key) => MIN_WIDTH_BY_KEY.has(key))
}

function widths(value: unknown): Record<string, number> | undefined {
  if (value === undefined) return undefined

  const entries = Object.entries(asRecord(value))
    .filter(([key]) => MIN_WIDTH_BY_KEY.has(key))
    .slice(0, CONTACT_TABLE_MAX_COLUMNS)
    .flatMap(([key, raw]) => {
      if (typeof raw !== 'number' || !Number.isFinite(raw)) return []
      const min = MIN_WIDTH_BY_KEY.get(key) ?? CONTACT_COLUMN_MIN_WIDTH
      return [[key, Math.min(Math.max(Math.round(raw), min), CONTACT_COLUMN_MAX_WIDTH)] as const]
    })

  return Object.fromEntries(entries)
}

function density(value: unknown): ContactViewDensity | undefined {
  return CONTACT_VIEW_DENSITIES.find((option) => option === value)
}

function compact<T extends object>(source: T): T {
  return Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined)) as T
}

export function sanitizeContactViewColumns(input: unknown): ContactViewColumns {
  const raw = asRecord(input)

  return compact({
    order: knownColumns(raw.order, CONTACT_TABLE_MAX_COLUMNS),
    hidden: knownColumns(raw.hidden, CONTACT_TABLE_MAX_COLUMNS),
    widths: widths(raw.widths),
    pinnedLeft: knownColumns(raw.pinnedLeft, CONTACT_TABLE_MAX_PINNED),
    pinnedRight: knownColumns(raw.pinnedRight, CONTACT_TABLE_MAX_PINNED),
  })
}

export function sanitizeContactTableState(input: unknown): ContactTableState {
  const raw = asRecord(input)
  const columns = sanitizeContactViewColumns(raw.columns)

  return compact({
    columns: Object.keys(columns).length > 0 ? columns : undefined,
    density: density(raw.density),
    listOrder: uniqueStrings(raw.listOrder, CONTACT_TABLE_MAX_COLUMNS),
  })
}

export function mergeContactTableState(current: unknown, incoming: unknown): ContactTableState {
  const base = sanitizeContactTableState(current)
  const patch = sanitizeContactTableState(incoming)
  const columns = { ...base.columns, ...patch.columns }

  return compact({
    columns: Object.keys(columns).length > 0 ? columns : undefined,
    density: patch.density ?? base.density,
    listOrder: patch.listOrder ?? base.listOrder,
  })
}
