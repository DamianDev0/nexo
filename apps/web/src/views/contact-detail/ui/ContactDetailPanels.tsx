'use client'

import { useTranslation } from 'react-i18next'

import { DealCardList } from '@/entities/deal'
import { ActivityCardList } from '@/features/preview-contact'
import { useHydrated } from '@/shared/lib/hooks/useHydrated'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'

import type { ContactTimelineFeed } from '@/entities/contact'
import type { ContactDealsFeed } from '@/entities/deal'
import type { ActivityGroups, ContactRecord } from '@/features/preview-contact'
import type { ContactActivity } from '@repo/shared-types'

type ContactDetailPanelsProps = {
  readonly activities: {
    readonly feed: ContactTimelineFeed
    readonly groups: ActivityGroups
    readonly onToggle?: (activity: ContactActivity) => void
  }
  readonly add: ContactRecord['add']
  readonly deals: ContactDealsFeed
}

const PANELS = [
  {
    id: 'notes',
    addKey: 'note',
    titleKey: 'contacts.preview.sections.notes',
    emptyKey: 'contacts.preview.empty.notes',
  },
  {
    id: 'tasks',
    addKey: 'task',
    titleKey: 'contacts.preview.sections.tasks',
    emptyKey: 'contacts.preview.empty.tasks',
  },
  {
    id: 'meetings',
    addKey: 'meeting',
    titleKey: 'contacts.preview.sections.meetings',
    emptyKey: 'contacts.preview.empty.meetings',
  },
] as const

export function ContactDetailPanels({
  activities,
  add,
  deals,
}: Readonly<ContactDetailPanelsProps>) {
  const { t } = useTranslation()
  const hydrated = useHydrated()
  const { feed, groups, onToggle } = activities

  if (!hydrated) return null

  return (
    <>
      {PANELS.map(({ id, addKey, titleKey, emptyKey }) => {
        const items = groups[id]
        const action = add[addKey]
        return (
          <RecordLayout.Panel
            key={id}
            id={id}
            title={t(titleKey)}
            action={action}
            closeLabel={t('contacts.detail.closePanel')}
          >
            <div className="flex flex-col gap-2 px-3 py-3">
              {items.length === 0 && !feed.isLoading ? (
                <RecordDrawer.Empty label={t(emptyKey)} />
              ) : (
                <ActivityCardList items={items} isLoading={feed.isLoading} onToggle={onToggle} />
              )}
            </div>
          </RecordLayout.Panel>
        )
      })}

      <RecordLayout.Panel
        id="deals"
        title={t('contacts.preview.sections.deals')}
        closeLabel={t('contacts.detail.closePanel')}
      >
        <div className="flex flex-col gap-2 px-3 py-3">
          {deals.deals.length === 0 && !deals.isLoading ? (
            <RecordDrawer.Empty label={t('contacts.preview.empty.deals')} />
          ) : (
            <DealCardList deals={deals.deals} isLoading={deals.isLoading} />
          )}
        </div>
      </RecordLayout.Panel>
    </>
  )
}
