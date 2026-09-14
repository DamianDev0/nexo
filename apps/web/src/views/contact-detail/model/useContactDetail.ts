'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useContact, useContactTimeline } from '@/entities/contact'
import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { openDealCount, useContactDeals } from '@/entities/deal'
import { useTagCatalog } from '@/entities/tag'
import { useArchiveContactDialog } from '@/features/archive-contact'
import { useContactComposers } from '@/features/compose-contact-actions'
import { useMergeContactsDialog } from '@/features/merge-contacts'
import { groupContactActivities } from '@/features/preview-contact'
import { ROUTES } from '@/shared/config/routes'

import { DETAIL_PANELS } from '../config/detail-panels.constants'
import { buildDetailRailItems } from '../lib/build-rail-items'

import { useContactDetailActions } from './useContactDetailActions'
import { usePanelRoute } from './usePanelRoute'

import type { DetailTabId } from '../config/detail-panels.constants'

export function useContactDetail(contactId: string) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<DetailTabId>('details')

  const panelRoute = usePanelRoute()
  const taxonomy = useContactTaxonomy()
  const composers = useContactComposers()
  const router = useRouter()
  const backToList = useCallback(() => router.push(ROUTES.app.contacts.list), [router])
  const archive = useArchiveContactDialog(backToList)
  const query = useContact(contactId)
  const mergeDialog = useMergeContactsDialog(query.contact, backToList)
  const actions = useContactDetailActions(composers, archive, mergeDialog.ask)
  const feed = useContactTimeline(contactId, true)
  const deals = useContactDeals(contactId)
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
          deals: openDealCount(deals.deals),
        },
        DETAIL_PANELS,
      ),
    [t, groups, deals.deals],
  )

  return {
    contact,
    isPending: query.isPending,
    isError: query.isError,
    retry: query.retry,
    taxonomy,
    actions,
    activities: { feed, groups, onToggle: actions.onToggleActivity },
    deals,
    tagsByName,
    composers,
    rail,
    archive,
    mergeDialog,
    panelRoute,
    tabs: { active: tab, select: setTab },
  }
}

export type ContactDetail = ReturnType<typeof useContactDetail>
