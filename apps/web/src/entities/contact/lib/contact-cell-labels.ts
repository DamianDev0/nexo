import { CONTACT_STALE_DAYS } from '../config/contact-columns.constants'

import { missingFieldsHint } from './contact-completeness'

import type { ContactCellLabels, TagsCellLabels } from '../model/types/contact-cells.types'
import type { TFunction } from 'i18next'

export function buildContactCellLabels(t: TFunction): ContactCellLabels {
  const copy = t('common.copy')
  const menu = t('common.table.actions')
  const tags: TagsCellLabels = {
    title: t('contacts.tagsPopover.title'),
    count: (total) => t('contacts.tagCount', { count: total }),
    add: t('contacts.cells.addTag'),
  }

  return {
    name: {
      preview: t('contacts.rowActions.preview'),
      addNote: t('contacts.rowActions.addNote'),
      editTags: t('contacts.rowActions.editTags'),
      restore: t('contacts.rowActions.restore'),
      rowMenu: menu,
      menu: {
        open: t('contacts.rowActions.open'),
        call: t('contacts.rowActions.call'),
        sms: t('contacts.rowActions.sms'),
        email: t('contacts.rowActions.email'),
        task: t('contacts.rowActions.task'),
        meeting: t('contacts.rowActions.meeting'),
      },
      missing: (fields) => missingFieldsHint(t, fields),
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
    saving: t('common.saving'),
    choice: {
      pick: (field) => t('contacts.cells.pick', { field }),
      clear: t('contacts.cells.clear'),
    },
    editable: {
      edit: (field) => t('contacts.cells.edit', { field }),
      save: t('common.save'),
      cancel: t('common.cancel'),
    },
    city: { field: t('contacts.form.city'), placeholder: t('contacts.form.cityPlaceholder') },
    nextActivity: {
      overdue: t('contacts.preview.tasks.overdueShort'),
      kind: (kind) => t(`contacts.preview.activityKinds.${kind}`),
    },
    owner: {
      trigger: t('contacts.preview.owner.trigger'),
      search: t('contacts.preview.owner.search'),
      empty: t('contacts.preview.owner.empty'),
      unassign: t('contacts.preview.owner.unassign'),
    },
    column: (key) => t(`contacts.columns.${key}`),
  }
}
