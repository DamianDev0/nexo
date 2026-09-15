import { IMPORT_EMPTY_CELL } from '../config/import-contacts.constants'

export function cellValue(value: unknown): string {
  if (Array.isArray(value)) return textOrEmpty(value.join(', '))
  if (typeof value === 'string') return textOrEmpty(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return IMPORT_EMPTY_CELL
}

function textOrEmpty(text: string): string {
  return text === '' ? IMPORT_EMPTY_CELL : text
}
