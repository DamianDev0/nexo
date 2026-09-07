import { CONTACT_ADDRESS_KEY } from '../config/contact-columns.constants'

import {
  contactDocumentLabel,
  contactMailHref,
  contactPhoneLabel,
  contactTelHref,
  contactWaHref,
} from './contact-links'

import type { ContactListItem } from '@repo/shared-types'
import type { TFunction } from 'i18next'

type ContactPreviewRow = {
  readonly key: string
  readonly label: string
  readonly value: string | null
  readonly href?: string
}

export function buildContactPreviewRows(
  t: TFunction,
  contact: ContactListItem,
): ReadonlyArray<ContactPreviewRow> {
  return [
    {
      key: 'email',
      label: t('contacts.form.email'),
      value: contact.email,
      href: contact.email ? contactMailHref(contact.email) : undefined,
    },
    {
      key: 'phone',
      label: t('contacts.form.phone'),
      value: contact.phone ? contactPhoneLabel(contact.phone) : null,
      href: contact.phone ? contactTelHref(contact.phone) : undefined,
    },
    {
      key: 'whatsapp',
      label: t('contacts.form.whatsapp'),
      value: contact.whatsapp ? contactPhoneLabel(contact.whatsapp) : null,
      href: contact.whatsapp ? contactWaHref(contact.whatsapp) : undefined,
    },
    {
      key: 'document',
      label: t('contacts.columns.documentNumber'),
      value: contact.documentNumber
        ? contactDocumentLabel(contact.documentType, contact.documentNumber)
        : null,
    },
    { key: 'role', label: t('contacts.form.role'), value: customText(contact, 'role') },
    { key: 'city', label: t('contacts.form.city'), value: contact.city },
    {
      key: 'address',
      label: t('contacts.form.address'),
      value: customText(contact, CONTACT_ADDRESS_KEY),
    },
  ]
}

export function customText(contact: ContactListItem, key: string): string | null {
  const value = contact.customFields?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}
