'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useContact, useContactTimeline } from '@/entities/contact'
import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { useTagCatalog } from '@/entities/tag'
import { useContactComposers } from '@/features/compose-contact-actions'
import { groupContactActivities } from '@/features/preview-contact'

import { DETAIL_PANELS, DEFAULT_DETAIL_PANEL } from '../config/detail-panels.constants'
import { buildDetailRailItems } from '../lib/build-rail-items'

import { useContactDetailActions } from './useContactDetailActions'

import type { DetailTabId } from '../config/detail-panels.constants'

export function useContactDetail(contactId: string) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<DetailTabId>('details')

  const query = useContact(contactId)
  const taxonomy = useContactTaxonomy()
  const composers = useContactComposers()
  const actions = useContactDetailActions(composers)
  const feed = useContactTimeline(contactId, true)
  const tagsByName = useTagCatalog('contact')
  const { contact } = query

  const groups = useMemo(() => groupContactActivities(feed.activities), [feed.activities])

  const rail = useMemo(
    () =>
      buildDetailRailItems(
        t,
        {
          notes: groups.notes.length,
          tasks: groups.tasks.length,
          meetings: groups.meetings.length,
        },
        DETAIL_PANELS,
      ),
    [t, groups],
  )

  return {
    contact,
    isPending: query.isPending,
    isError: query.isError,
    retry: query.retry,
    taxonomy,
    actions,
    activities: { feed, groups, onToggle: actions.onToggleActivity },
    tagsByName,
    composers,
    rail,
    defaultPanel: DEFAULT_DETAIL_PANEL,
    tabs: { active: tab, select: setTab },
  }
}

export type ContactDetail = ReturnType<typeof useContactDetail>
