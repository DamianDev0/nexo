import type { ContactFieldsPatch } from '../model/types/contact-cells.types'

export function clearedFieldsToNull(patch: ContactFieldsPatch): ContactFieldsPatch {
  const normalised: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(patch)) {
    normalised[key] = typeof value === 'string' && value.trim() === '' ? null : value
  }
  return normalised as ContactFieldsPatch
}
