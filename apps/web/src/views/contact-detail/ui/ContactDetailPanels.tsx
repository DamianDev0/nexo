'use client'

import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { DealCardList } from '@/entities/deal'
import { ActivityCardList } from '@/features/preview-contact'
import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { useHydrated } from '@/shared/lib/hooks/useHydrated'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'

import { DETAIL_PANELS } from '../config/detail-panels.constants'

import type { DetailPanelId } from '../config/detail-panels.constants'
import type { ContactTimelineFeed } from '@/entities/contact'
import type { ContactDealsFeed } from '@/entities/deal'
import type { ActivityGroups, ContactRecord } from '@/features/preview-contact'
import type { PanelAction } from '@/shared/ui/organisms/record-layout'
import type { ContactActivity } from '@repo/shared-types'
import type { ReactNode } from 'react'

type ContactDetailPanelsProps = {
  readonly activities: {
    readonly feed: ContactTimelineFeed
    readonly groups: ActivityGroups
    readonly onToggle?: (activity: ContactActivity) => void
  }
  readonly add: ContactRecord['add']
  readonly deals: ContactDealsFeed
}

type PanelDef = {
  readonly title: string
  readonly empty: string
  readonly isEmpty: boolean
  readonly content: ReactNode
  readonly action?: PanelAction
}

export function ContactDetailPanels({
  activities,
  add,
  deals,
}: Readonly<ContactDetailPanelsProps>) {
  const { t } = useTranslation()
  const hydrated = useHydrated()
  const reveal = useReducedTransition(quickEase)
  const { feed, groups, onToggle } = activities

  if (!hydrated) return null

  const activityPanel = (kind: 'notes' | 'tasks' | 'meetings', action?: PanelAction): PanelDef => ({
    title: t(`contacts.preview.sections.${kind}`),
    empty: t(`contacts.preview.empty.${kind}`),
    isEmpty: groups[kind].length === 0 && !feed.isLoading,
    content: (
      <ActivityCardList items={groups[kind]} isLoading={feed.isLoading} onToggle={onToggle} />
    ),
    action,
  })

  const panels: Readonly<Record<DetailPanelId, PanelDef>> = {
    notes: activityPanel('notes', add.note),
    tasks: activityPanel('tasks', add.task),
    meetings: activityPanel('meetings', add.meeting),
    deals: {
      title: t('contacts.preview.sections.deals'),
      empty: t('contacts.preview.empty.deals'),
      isEmpty: deals.deals.length === 0 && !deals.isLoading,
      content: <DealCardList deals={deals.deals} isLoading={deals.isLoading} />,
    },
  }

  return (
    <>
      {DETAIL_PANELS.map((id) => {
        const panel = panels[id]
        return (
          <RecordLayout.Panel
            key={id}
            id={id}
            title={panel.title}
            action={panel.action}
            closeLabel={t('contacts.detail.closePanel')}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reveal}
              className="flex flex-col gap-2 px-3 py-3"
            >
              {panel.isEmpty ? <RecordDrawer.Empty label={panel.empty} /> : panel.content}
            </motion.div>
          </RecordLayout.Panel>
        )
      })}
    </>
  )
}
