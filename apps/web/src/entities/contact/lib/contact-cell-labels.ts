import { CONTACT_STALE_DAYS } from '../config/contact-columns.constants'

import type { ContactCellLabels, TagsCellLabels } from '../model/types/contact-cells.types'
import type { TFunction } from 'i18next'

export function buildContactCellLabels(t: TFunction): ContactCellLabels {
  const copy = t('common.copy')
  const tags: TagsCellLabels = {
    title: t('contacts.tagsPopover.title'),
    count: (total) => t('contacts.tagCount', { count: total }),
  }

  return {
    name: { preview: t('contacts.rowActions.preview'), tags },
    phone: { copy, action: t('contacts.rowActions.call') },
    whatsapp: {
      copy,
      action: t('contacts.rowActions.whatsapp'),
      blocked: t('contacts.optOut.whatsapp'),
    },
    email: { copy, action: t('contacts.rowActions.email'), blocked: t('contacts.optOut.email') },
    document: { copy, invalid: t('contacts.document.invalid') },
    tags,
    stale: t('contacts.recency.stale', { days: CONTACT_STALE_DAYS }),
  }
}
