import type { ContactOwnerChange } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

export function applyOwner(contact: ContactListItem, change: ContactOwnerChange): ContactListItem {
  return { ...contact, assignedToId: change.assignedToId, assignedToName: change.assignedToName }
}
