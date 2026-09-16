import type { ContactListItem } from '@repo/shared-types'

export type CustomFieldsChange = { id: string; customFields: Record<string, unknown> }

export function applyCustomFields(
  contact: ContactListItem,
  change: CustomFieldsChange,
): ContactListItem {
  const merged = { ...contact.customFields, ...change.customFields }
  const customFields = Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value !== null && value !== undefined),
  )
  return { ...contact, customFields }
}
