import type { ContactListItem } from '@repo/shared-types'

export type CustomFieldsChange = { id: string; customFields: Record<string, unknown> }

export function applyCustomFields(
  contact: ContactListItem,
  change: CustomFieldsChange,
): ContactListItem {
  return { ...contact, customFields: change.customFields }
}
