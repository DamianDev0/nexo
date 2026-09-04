import { CUSTOM_COLUMN_PREFIX } from '@repo/shared-types'

import { contactFullName } from './contact-display'

import type { ContactListItem } from '@repo/shared-types'

export function contactAccessor(key: string): (contact: ContactListItem) => unknown {
  if (key === 'name') return contactFullName
  if (key.startsWith(CUSTOM_COLUMN_PREFIX)) {
    const fieldKey = key.slice(CUSTOM_COLUMN_PREFIX.length)
    return (contact) => contact.customFields?.[fieldKey]
  }
  return (contact) => Reflect.get(contact, key)
}
