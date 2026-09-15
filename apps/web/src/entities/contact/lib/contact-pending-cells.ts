import { CUSTOM_COLUMN_PREFIX } from '@repo/shared-types'

import { CONTACT_COLUMN_FIELDS } from '../config/contact-column-fields'

export function pendingCellToken(id: string, key: string): string {
  return `${id}:${key}`
}

export function columnFields(columnKey: string): ReadonlyArray<string> {
  if (columnKey.startsWith(CUSTOM_COLUMN_PREFIX)) return ['customFields']
  return CONTACT_COLUMN_FIELDS[columnKey] ?? []
}

export function isColumnSaving(
  cells: ReadonlySet<string> | undefined,
  id: string,
  columnKey: string,
): boolean {
  if (!cells || cells.size === 0) return false
  return columnFields(columnKey).some((field) => cells.has(pendingCellToken(id, field)))
}
