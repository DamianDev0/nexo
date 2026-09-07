import { CONTACT_ADDRESS_KEY, contactAvatarUrl } from '@/entities/contact'

import { resolveWhatsapp, type ContactFormValues } from './contact-form.schema'

import type { ContactInput, ContactListItem, FieldDef } from '@repo/shared-types'

export function stripNullValues(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== null))
}

export function pickCustomFieldValues(
  values: Record<string, unknown>,
  defs: ReadonlyArray<Pick<FieldDef, 'key'>>,
): Record<string, unknown> {
  const editable = new Set(defs.map((def) => def.key))
  return Object.fromEntries(Object.entries(values).filter(([key]) => editable.has(key)))
}

function withAddress(
  values: ContactFormValues,
  customFields: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const merged = values.address
    ? { ...customFields, [CONTACT_ADDRESS_KEY]: values.address }
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
      typeof contact.customFields?.[CONTACT_ADDRESS_KEY] === 'string'
        ? contact.customFields[CONTACT_ADDRESS_KEY]
        : '',
    city: contact.city ?? '',
    municipioCode: contact.municipioCode ?? '',
    status: contact.status,
    avatarUrl: contactAvatarUrl(contact),
    source: contact.source ?? '',
    lifecycleStage: contact.lifecycleStage ?? '',
  }
}
