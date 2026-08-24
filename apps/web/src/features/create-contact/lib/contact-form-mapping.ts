import { contactAvatarUrl } from '@/entities/contact'

import { CONTACT_TYPE_OTHER_KEY } from '../config/contact-type.constants'

import { resolveWhatsapp, type ContactFormValues } from './contact-form.schema'

import type { ContactInput, ContactListItem } from '@repo/shared-types'

export function toInput(
  values: ContactFormValues,
  customFields: Record<string, unknown>,
): ContactInput {
  return {
    customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
    firstName: values.firstName,
    lastName: values.lastName || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    whatsapp: resolveWhatsapp(values) || undefined,
    address: values.address || undefined,
    city: values.city || undefined,
    municipioCode: values.municipioCode || undefined,
    status: values.status,
    avatarUrl: values.avatarUrl || undefined,
    source: values.source || undefined,
    type: values.type || undefined,
    lifecycleStage: values.lifecycleStage || undefined,
    typeLabel:
      values.type === CONTACT_TYPE_OTHER_KEY && values.typeLabel ? values.typeLabel : undefined,
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
    address: contact.address ?? '',
    city: contact.city ?? '',
    municipioCode: contact.municipioCode ?? '',
    status: contact.status,
    avatarUrl: contactAvatarUrl(contact),
    source: contact.source ?? '',
    type: contact.type ?? '',
    typeLabel: contact.typeLabel ?? '',
    lifecycleStage: contact.lifecycleStage ?? '',
  }
}
