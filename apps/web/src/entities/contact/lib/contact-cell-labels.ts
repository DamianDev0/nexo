import { CONTACT_STALE_DAYS } from '../config/contact-columns.constants'

import type { ContactCellLabels, TagsCellLabels } from '../model/types/contact-cells.types'
import type { TFunction } from 'i18next'

export function buildContactCellLabels(t: TFunction): ContactCellLabels {
  const copy = t('common.copy')
  const menu = t('common.table.actions')
  const tags: TagsCellLabels = {
    title: t('contacts.tagsPopover.title'),
    count: (total) => t('contacts.tagCount', { count: total }),
  }

  return {
    name: {
      preview: t('contacts.rowActions.preview'),
      addNote: t('contacts.rowActions.addNote'),
      editTags: t('contacts.rowActions.editTags'),
      restore: t('contacts.rowActions.restore'),
      tags,
      notes: { title: t('contacts.notesPopover.title') },
    },
    phone: {
      copy,
      menu,
      action: t('contacts.rowActions.call'),
      compose: t('contacts.rowActions.sms'),
    },
    whatsapp: {
      copy,
      menu,
      action: t('contacts.rowActions.whatsapp'),
      blocked: t('contacts.optOut.whatsapp'),
    },
    email: {
      copy,
      menu,
      action: t('contacts.rowActions.email'),
      blocked: t('contacts.optOut.email'),
    },
    document: { copy, menu, invalid: t('contacts.document.invalid') },
    tags,
    stale: t('contacts.recency.stale', { days: CONTACT_STALE_DAYS }),
  }
}
