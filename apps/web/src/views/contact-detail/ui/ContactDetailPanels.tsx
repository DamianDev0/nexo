'use client'

import { useTranslation } from 'react-i18next'

import { ActivityList, ActivityTimeline } from '@/features/preview-contact'
import { useHydrated } from '@/shared/lib/hooks/useHydrated'
import { Chip } from '@/shared/ui/atoms/chip'
import { Text } from '@/shared/ui/atoms/text'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'

import type { ContactTimelineFeed } from '@/entities/contact'
import type { ActivityGroups } from '@/features/preview-contact'
import type { ContactActivity, ContactListItem, Tag } from '@repo/shared-types'

type ContactDetailPanelsProps = {
  readonly contact: ContactListItem
  readonly activities: {
    readonly feed: ContactTimelineFeed
    readonly groups: ActivityGroups
    readonly onToggle?: (activity: ContactActivity) => void
  }
  readonly tagsByName: ReadonlyMap<string, Tag>
}

export function ContactDetailPanels({
  contact,
  activities,
  tagsByName,
}: Readonly<ContactDetailPanelsProps>) {
  const { t } = useTranslation()
  const hydrated = useHydrated()
  const { feed, groups, onToggle } = activities
  const closeLabel = t('contacts.detail.closePanel')

  const list = (items: ReadonlyArray<ContactActivity>, emptyKey: string) =>
    items.length === 0 && !feed.isLoading ? (
      <RecordDrawer.Empty label={t(emptyKey)} />
    ) : (
      <ActivityList items={items} isLoading={feed.isLoading} onToggle={onToggle} />
    )

  if (!hydrated) return null

  return (
    <>
      <RecordLayout.Panel
        id="activity"
        title={t('contacts.preview.sections.activity')}
        closeLabel={closeLabel}
      >
        <div className="px-3 py-3">
          <ActivityTimeline feed={feed} onToggle={onToggle} />
        </div>
      </RecordLayout.Panel>

      <RecordLayout.Panel
        id="notes"
        title={t('contacts.preview.sections.notes')}
        closeLabel={closeLabel}
      >
        <div className="px-3 py-3">{list(groups.notes, 'contacts.preview.empty.notes')}</div>
      </RecordLayout.Panel>

      <RecordLayout.Panel
        id="tasks"
        title={t('contacts.preview.sections.tasks')}
        closeLabel={closeLabel}
      >
        <div className="px-3 py-3">{list(groups.tasks, 'contacts.preview.empty.tasks')}</div>
      </RecordLayout.Panel>

      <RecordLayout.Panel
        id="meetings"
        title={t('contacts.preview.sections.meetings')}
        closeLabel={closeLabel}
      >
        <div className="px-3 py-3">{list(groups.meetings, 'contacts.preview.empty.meetings')}</div>
      </RecordLayout.Panel>

      <RecordLayout.Panel
        id="tags"
        title={t('contacts.preview.sections.tags')}
        closeLabel={closeLabel}
      >
        <div className="flex flex-wrap gap-2 px-3 py-3">
          {contact.tags.map((name) => (
            <Chip key={name} color={tagsByName.get(name.toLowerCase())?.color}>
              {name}
            </Chip>
          ))}
          {contact.tags.length === 0 ? (
            <Text variant="muted">{t('contacts.preview.empty.tags')}</Text>
          ) : null}
        </div>
      </RecordLayout.Panel>
    </>
  )
}
