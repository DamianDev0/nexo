'use client'

import { useTranslation } from 'react-i18next'

import { ActivityList } from '@/features/preview-contact'
import { useHydrated } from '@/shared/lib/hooks/useHydrated'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'

import type { ContactTimelineFeed } from '@/entities/contact'
import type { ActivityGroups } from '@/features/preview-contact'
import type { ContactActivity } from '@repo/shared-types'

type ContactDetailPanelsProps = {
  readonly activities: {
    readonly feed: ContactTimelineFeed
    readonly groups: ActivityGroups
    readonly onToggle?: (activity: ContactActivity) => void
  }
}

const PANELS = [
  {
    id: 'notes',
    titleKey: 'contacts.preview.sections.notes',
    emptyKey: 'contacts.preview.empty.notes',
  },
  {
    id: 'tasks',
    titleKey: 'contacts.preview.sections.tasks',
    emptyKey: 'contacts.preview.empty.tasks',
  },
  {
    id: 'meetings',
    titleKey: 'contacts.preview.sections.meetings',
    emptyKey: 'contacts.preview.empty.meetings',
  },
] as const

export function ContactDetailPanels({ activities }: Readonly<ContactDetailPanelsProps>) {
  const { t } = useTranslation()
  const hydrated = useHydrated()
  const { feed, groups, onToggle } = activities

  if (!hydrated) return null

  return (
    <>
      {PANELS.map(({ id, titleKey, emptyKey }) => {
        const items = groups[id]
        return (
          <RecordLayout.Panel
            key={id}
            id={id}
            title={t(titleKey)}
            closeLabel={t('contacts.detail.closePanel')}
          >
            <div className="px-3 py-3">
              {items.length === 0 && !feed.isLoading ? (
                <RecordDrawer.Empty label={t(emptyKey)} />
              ) : (
                <ActivityList items={items} isLoading={feed.isLoading} onToggle={onToggle} />
              )}
            </div>
          </RecordLayout.Panel>
        )
      })}
    </>
  )
}
