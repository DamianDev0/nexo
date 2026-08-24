import type { ContactDuplicateMatch, ContactDuplicatePayload } from '@repo/shared-types'
import type { TFunction } from 'i18next'

const duplicateMessageKeys: Record<ContactDuplicatePayload['field'], string> = {
  email: 'contacts.duplicates.emailTaken',
  documentNumber: 'contacts.duplicates.documentTaken',
  phone: 'contacts.duplicates.phoneMatch',
  name: 'contacts.duplicates.nameMatch',
}

export function duplicateMatchName(match: ContactDuplicateMatch): string {
  return [match.firstName, match.lastName].filter(Boolean).join(' ')
}

export function duplicateMessage(
  t: TFunction,
  payload: ContactDuplicatePayload,
  entity: string,
): string {
  const first = payload.matches[0]
  return t(duplicateMessageKeys[payload.field], {
    name: first ? duplicateMatchName(first) : '',
    entity,
  })
}

export function duplicateFormField(
  field: ContactDuplicatePayload['field'],
): 'email' | 'phone' | 'firstName' | null {
  if (field === 'email') return 'email'
  if (field === 'phone') return 'phone'
  if (field === 'name') return 'firstName'
  return null
}
