import type { ContactGroup } from '../model/types/call.types'
import type { ContactListItem } from '@repo/shared-types'

function initialOf(contact: ContactListItem): string {
  const primary = contact.firstName.trim()
  const source = primary === '' ? (contact.lastName ?? '').trim() : primary
  const first = source.charAt(0).toUpperCase()
  return /[A-ZÁÉÍÓÚÑ]/.test(first) ? first : '#'
}

export function groupContactsByInitial(
  contacts: readonly ContactListItem[],
): readonly ContactGroup[] {
  const groups = new Map<string, ContactListItem[]>()
  for (const contact of contacts) {
    const letter = initialOf(contact)
    const bucket = groups.get(letter)
    if (bucket) bucket.push(contact)
    else groups.set(letter, [contact])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([letter, grouped]) => ({ letter, contacts: grouped }))
}
