import { z } from 'zod'

import {
  clearedFieldsToNull,
  CONTACT_ADDRESS_KEY,
  contactCoreFieldsSchema,
} from '@/entities/contact'

import type { ContactFieldsPatch } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export function buildContactDetailsSchema(t: TFunction) {
  return contactCoreFieldsSchema(t).extend({ documentNumber: z.string().trim() })
}

export type ContactDetailsSchema = ReturnType<typeof buildContactDetailsSchema>
export type ContactDetailsValues = z.infer<ContactDetailsSchema>
export type ContactDetailsField = keyof ContactDetailsValues

export function contactDetailsDefaults(contact: ContactListItem): ContactDetailsValues {
  const address = contact.customFields?.[CONTACT_ADDRESS_KEY]
  return {
    firstName: contact.firstName,
    lastName: contact.lastName ?? '',
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    whatsapp: contact.whatsapp ?? '',
    address: typeof address === 'string' ? address : '',
    city: contact.city ?? '',
    municipioCode: contact.municipioCode ?? '',
    documentNumber: contact.documentNumber ?? '',
    source: contact.source ?? '',
  }
}

export function buildDetailsPatch(
  field: ContactDetailsField,
  values: ContactDetailsValues,
  contact: ContactListItem,
): ContactFieldsPatch | null {
  const current = contactDetailsDefaults(contact)
  if (values[field] === current[field]) return null
  if (field === 'city') {
    return clearedFieldsToNull({ city: values.city, municipioCode: values.municipioCode })
  }
  return clearedFieldsToNull({ [field]: values[field] })
}

export function buildAddressCustomFields(
  contact: ContactListItem,
  address: string,
): Record<string, unknown> | null {
  if (address === contactDetailsDefaults(contact).address) return null
  return { ...contact.customFields, [CONTACT_ADDRESS_KEY]: address }
}
