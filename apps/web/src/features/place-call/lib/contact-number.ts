import type { ContactListItem } from '@repo/shared-types'

export function contactNumber(contact: ContactListItem): string | null {
  return contact.phone ?? contact.whatsapp
}
