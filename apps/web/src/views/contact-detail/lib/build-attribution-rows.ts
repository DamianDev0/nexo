import { timeAgo } from '@repo/shared-utils'

import type { FieldRow } from '@/shared/ui/organisms/record-drawer'
import type { ContactListItem } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export function buildAttributionRows(
  t: TFunction,
  contact: ContactListItem,
  locale: string,
): ReadonlyArray<FieldRow> {
  return [
    {
      key: 'source',
      label: t('contacts.detail.attribution.source'),
      value: contact.source ?? t('contacts.detail.attribution.noSource'),
    },
    {
      key: 'owner',
      label: t('contacts.detail.attribution.owner'),
      value: contact.assignedToName ?? t('contacts.detail.attribution.unassigned'),
    },
    {
      key: 'lastContacted',
      label: t('contacts.detail.attribution.lastContacted'),
      value: contact.lastContactedAt
        ? timeAgo(contact.lastContactedAt, locale)
        : t('contacts.detail.attribution.never'),
    },
    {
      key: 'createdAt',
      label: t('contacts.detail.attribution.createdAt'),
      value: timeAgo(contact.createdAt, locale),
    },
  ]
}
