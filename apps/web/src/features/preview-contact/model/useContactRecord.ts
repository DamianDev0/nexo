'use client'

import { timeAgo } from '@repo/shared-utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  buildContactPreviewRows,
  contactAvatarUrl,
  contactFullName,
  missingContactFields,
  missingFieldsHint,
} from '@/entities/contact'
import { useEntityTerms } from '@/entities/nomenclature'

import { buildContactQuickActions } from '../lib/quick-actions'
import { buildStatusHighlight } from '../lib/status-highlight'

import type { ContactRowActions, ContactTaxonomyMaps } from '@/entities/contact'
import type { SectionAction } from '@/shared/ui/organisms/record-drawer'
import type { ContactListItem } from '@repo/shared-types'

type ContactRecordSource = {
  readonly contact: ContactListItem
  readonly taxonomy: ContactTaxonomyMaps
  readonly actions: ContactRowActions
}

function sectionAction(label: string, onClick?: () => void): SectionAction | undefined {
  return onClick ? { label, onClick } : undefined
}

export function useContactRecord({ contact, taxonomy, actions }: ContactRecordSource) {
  const { t, i18n } = useTranslation()
  const terms = useEntityTerms('contact')
  const locale = i18n.language

  return useMemo(() => {
    const status = buildStatusHighlight(contact, taxonomy)
    return {
      name: contactFullName(contact),
      avatarUrl: contactAvatarUrl(contact),
      missingHint: missingFieldsHint(t, missingContactFields(contact)),
      entityTitle: terms.singular,
      sources: [...taxonomy.sourceByKey.values()],
      savers: { fields: actions.onFieldsChange, customFields: actions.onCustomFieldsChange },
      rows: buildContactPreviewRows(t, contact),
      quickActions: buildContactQuickActions(t, contact, actions),
      status: {
        ...status,
        sinceLabel: status.since ? timeAgo(status.since, locale) : null,
      },
      add: {
        note: sectionAction(
          t('contacts.preview.quickActions.note'),
          actions.onAddNote ? () => actions.onAddNote?.(contact) : undefined,
        ),
        task: sectionAction(
          t('contacts.preview.quickActions.task'),
          actions.onLogActivity ? () => actions.onLogActivity?.('task', contact) : undefined,
        ),
        meeting: sectionAction(
          t('contacts.preview.quickActions.meeting'),
          actions.onLogActivity ? () => actions.onLogActivity?.('meeting', contact) : undefined,
        ),
        tags: sectionAction(
          t('contacts.preview.quickActions.tag'),
          actions.onEditTags ? () => actions.onEditTags?.(contact) : undefined,
        ),
      },
    }
  }, [contact, taxonomy, actions, t, locale, terms])
}

export type ContactRecord = ReturnType<typeof useContactRecord>
