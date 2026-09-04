import { IMPORT_EMPTY_CELL } from '../config/import-contacts.constants'

export function cellValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ') || IMPORT_EMPTY_CELL
  if (typeof value === 'string') return value || IMPORT_EMPTY_CELL
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return IMPORT_EMPTY_CELL
}
