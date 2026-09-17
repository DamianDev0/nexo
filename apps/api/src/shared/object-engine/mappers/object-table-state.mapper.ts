import {
  CUSTOM_COLUMN_PREFIX,
  OBJECT_COLUMN_MAX_WIDTH,
  OBJECT_CUSTOM_COLUMN_MIN_WIDTH,
  OBJECT_TABLE_MAX_COLUMNS,
  OBJECT_TABLE_MAX_PINNED,
  OBJECT_VIEW_DENSITIES,
} from '@repo/shared-types'
import type {
  ObjectColumnDef,
  ObjectTableState,
  ObjectViewColumns,
  ObjectViewDensity,
} from '@repo/shared-types'

const CUSTOM_COLUMN_KEY = /^custom:[A-Za-z][A-Za-z0-9_]{0,63}$/

export type ColumnMinWidths = ReadonlyMap<string, number>

export function columnMinWidths(columns: ReadonlyArray<ObjectColumnDef>): ColumnMinWidths {
  return new Map(columns.map((column) => [column.key, column.minWidth]))
}

function minWidthOf(key: string, catalog: ColumnMinWidths): number | undefined {
  const known = catalog.get(key)
  if (known !== undefined) return known
  if (key.startsWith(CUSTOM_COLUMN_PREFIX) && CUSTOM_COLUMN_KEY.test(key)) {
    return OBJECT_CUSTOM_COLUMN_MIN_WIDTH
  }
  return undefined
}

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

function knownColumns(
  value: unknown,
  limit: number,
  catalog: ColumnMinWidths,
): string[] | undefined {
  return uniqueStrings(value, limit)?.filter((key) => minWidthOf(key, catalog) !== undefined)
}

function widths(value: unknown, catalog: ColumnMinWidths): Record<string, number> | undefined {
  if (value === undefined) return undefined

  const entries = Object.entries(asRecord(value))
    .filter(([key]) => minWidthOf(key, catalog) !== undefined)
    .slice(0, OBJECT_TABLE_MAX_COLUMNS)
    .flatMap(([key, raw]) => {
      if (typeof raw !== 'number' || !Number.isFinite(raw)) return []
      const min = minWidthOf(key, catalog) ?? OBJECT_CUSTOM_COLUMN_MIN_WIDTH
      return [[key, Math.min(Math.max(Math.round(raw), min), OBJECT_COLUMN_MAX_WIDTH)] as const]
    })

  return Object.fromEntries(entries)
}

function density(value: unknown): ObjectViewDensity | undefined {
  return OBJECT_VIEW_DENSITIES.find((option) => option === value)
}

function compact<T extends object>(source: T): T {
  return Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined)) as T
}

export function sanitizeViewColumns(input: unknown, catalog: ColumnMinWidths): ObjectViewColumns {
  const raw = asRecord(input)

  return compact({
    order: knownColumns(raw.order, OBJECT_TABLE_MAX_COLUMNS, catalog),
    hidden: knownColumns(raw.hidden, OBJECT_TABLE_MAX_COLUMNS, catalog),
    widths: widths(raw.widths, catalog),
    pinnedLeft: knownColumns(raw.pinnedLeft, OBJECT_TABLE_MAX_PINNED, catalog),
    pinnedRight: knownColumns(raw.pinnedRight, OBJECT_TABLE_MAX_PINNED, catalog),
  })
}

export function sanitizeTableState(input: unknown, catalog: ColumnMinWidths): ObjectTableState {
  const raw = asRecord(input)
  const columns = sanitizeViewColumns(raw.columns, catalog)

  return compact({
    columns: Object.keys(columns).length > 0 ? columns : undefined,
    density: density(raw.density),
    listOrder: uniqueStrings(raw.listOrder, OBJECT_TABLE_MAX_COLUMNS),
  })
}

export function mergeTableState(
  current: unknown,
  incoming: unknown,
  catalog: ColumnMinWidths,
): ObjectTableState {
  const base = sanitizeTableState(current, catalog)
  const patch = sanitizeTableState(incoming, catalog)
  const columns = { ...base.columns, ...patch.columns }

  return compact({
    columns: Object.keys(columns).length > 0 ? columns : undefined,
    density: patch.density ?? base.density,
    listOrder: patch.listOrder ?? base.listOrder,
  })
}
