import { CONTACT_REQUIRED_FIELDS } from '../config/contact-columns.constants'

import type { ContactListItem } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export type ContactRequiredField = (typeof CONTACT_REQUIRED_FIELDS)[number]

type CompletenessSource = Pick<ContactListItem, 'email' | 'phone' | 'whatsapp' | 'documentNumber'>

const PRESENT: Record<ContactRequiredField, (contact: CompletenessSource) => boolean> = {
  email: (contact) => Boolean(contact.email),
  phone: (contact) => Boolean(contact.phone ?? contact.whatsapp),
  documentNumber: (contact) => Boolean(contact.documentNumber),
}

const FIELD_LABEL_KEY: Record<ContactRequiredField, string> = {
  email: 'contacts.form.email',
  phone: 'contacts.form.phone',
  documentNumber: 'contacts.columns.documentNumber',
}

export function missingContactFields(
  contact: CompletenessSource,
): ReadonlyArray<ContactRequiredField> {
  return CONTACT_REQUIRED_FIELDS.filter((field) => !PRESENT[field](contact))
}

export function missingFieldsHint(
  t: TFunction,
  fields: ReadonlyArray<ContactRequiredField>,
): string | null {
  if (fields.length === 0) return null
  const labels = fields.map((field) => t(FIELD_LABEL_KEY[field]).toLocaleLowerCase())
  return t('contacts.completeness.missing', { fields: labels.join(', ') })
}
