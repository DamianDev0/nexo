import { contactPlaceLabel } from './contact-display'
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
    { key: 'jobTitle', label: t('contacts.columns.jobTitle'), value: contact.jobTitle },
    {
      key: 'city',
      label: t('contacts.form.city'),
      value: contactPlaceLabel(contact.city, contact.department),
    },
    { key: 'address', label: t('contacts.form.address'), value: contact.address },
  ]
}
