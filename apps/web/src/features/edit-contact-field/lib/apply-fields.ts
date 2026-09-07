import type { ContactFieldsPatch } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

export type FieldsChange = { readonly id: string; readonly patch: ContactFieldsPatch }

export function applyFields(contact: ContactListItem, change: FieldsChange): ContactListItem {
  return { ...contact, ...change.patch }
}
