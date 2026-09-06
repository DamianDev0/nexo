import { contactAvatarUrl } from '@/entities/contact'

import { resolveWhatsapp, type ContactFormValues } from './contact-form.schema'

import type { ContactInput, ContactListItem } from '@repo/shared-types'

export function stripNullValues(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== null))
}

export const ADDRESS_FIELD_KEY = 'address'

function withAddress(
  values: ContactFormValues,
  customFields: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const merged = values.address
    ? { ...customFields, [ADDRESS_FIELD_KEY]: values.address }
    : customFields
  return Object.keys(merged).length > 0 ? merged : undefined
}

export function toInput(
  values: ContactFormValues,
  customFields: Record<string, unknown>,
): ContactInput {
  return {
    customFields: withAddress(values, customFields),
    firstName: values.firstName,
    lastName: values.lastName || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    whatsapp: resolveWhatsapp(values) || undefined,
    city: values.city || undefined,
    municipioCode: values.municipioCode || undefined,
    status: values.status,
    avatarUrl: values.avatarUrl || undefined,
    source: values.source || undefined,
    lifecycleStage: values.lifecycleStage || undefined,
  }
}

export function toFormValues(contact: ContactListItem): ContactFormValues {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName ?? '',
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    whatsapp: contact.whatsapp ?? '',
    whatsappSameAsPhone: Boolean(contact.phone) && contact.phone === contact.whatsapp,
    address:
      typeof contact.customFields?.[ADDRESS_FIELD_KEY] === 'string'
        ? contact.customFields[ADDRESS_FIELD_KEY]
        : '',
    city: contact.city ?? '',
    municipioCode: contact.municipioCode ?? '',
    status: contact.status,
    avatarUrl: contactAvatarUrl(contact),
    source: contact.source ?? '',
    lifecycleStage: contact.lifecycleStage ?? '',
  }
}
