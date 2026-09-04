import type { ContactListItem } from '@repo/shared-types'

export type StatusChange = { id: string; status: string }

export function applyStatus(contact: ContactListItem, change: StatusChange): ContactListItem {
  return { ...contact, status: change.status, statusChangedAt: new Date().toISOString() }
}
