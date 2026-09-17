import { CUSTOM_COLUMN_PREFIX } from '@repo/shared-types'

import { CONTACT_COLUMN_FIELDS } from '../config/contact-column-fields'

export function columnFields(columnKey: string): ReadonlyArray<string> {
  if (columnKey.startsWith(CUSTOM_COLUMN_PREFIX)) return ['customFields']
  return CONTACT_COLUMN_FIELDS[columnKey] ?? []
}
