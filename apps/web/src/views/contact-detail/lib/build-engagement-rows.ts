import { timeAgo } from '@repo/shared-utils'

import type { FieldRow } from '@/shared/ui/organisms/record-drawer'
import type { ContactListItem } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export function buildEngagementRows(
  t: TFunction,
  contact: ContactListItem,
  locale: string,
): ReadonlyArray<FieldRow> {
  return [
    {
      key: 'lifecycle',
      label: t('contacts.detail.engagement.lifecycle'),
      value: contact.lifecycleStage,
    },
    {
      key: 'owner',
      label: t('contacts.detail.engagement.owner'),
      value: contact.assignedToName ?? t('contacts.detail.engagement.unassigned'),
    },
    {
      key: 'lastContacted',
      label: t('contacts.detail.engagement.lastContacted'),
      value: contact.lastContactedAt
        ? timeAgo(contact.lastContactedAt, locale)
        : t('contacts.detail.engagement.never'),
    },
    {
      key: 'createdAt',
      label: t('contacts.detail.engagement.createdAt'),
      value: timeAgo(contact.createdAt, locale),
    },
  ]
}
