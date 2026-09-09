'use client'

import { useTranslation } from 'react-i18next'

import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { Chip } from '@/shared/ui/atoms/chip'
import { Text } from '@/shared/ui/atoms/text'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'

import { groupContactActivities } from '../lib/activity-groups'

import { ActivityList } from './ActivityList'
import { ActivityTimeline } from './ActivityTimeline'
import { ContactDetailsForm } from './ContactDetailsForm'

import type { ContactRecord } from '../model/useContactRecord'
import type { ContactTimelineFeed } from '@/entities/contact'
import type { ContactActivity, ContactListItem, Tag } from '@repo/shared-types'

const STORAGE_KEY = 'record-drawer:contact'
const DEFAULT_OPEN = ['details'] as const

type ContactRecordSectionsProps = {
  readonly contact: ContactListItem
  readonly record: ContactRecord
  readonly activities: {
    readonly feed: ContactTimelineFeed
    readonly onToggle?: (activity: ContactActivity) => void
  }
  readonly tagsByName: ReadonlyMap<string, Tag>
}

export function ContactRecordSections({
  contact,
  record,
  activities,
  tagsByName,
}: Readonly<ContactRecordSectionsProps>) {
  const { t } = useTranslation()
  const { feed, onToggle } = activities
  const groups = groupContactActivities(feed.activities)
  const optedOut = contact.optedOutChannels

  const listOrEmpty = (
    items: ReadonlyArray<ContactActivity>,
    emptyKey: string,
    action: ContactRecord['add'][keyof ContactRecord['add']],
  ) =>
    items.length === 0 && !feed.isLoading ? (
      <RecordDrawer.Empty label={t(emptyKey)} action={action} />
    ) : (
      <ActivityList items={items} isLoading={feed.isLoading} onToggle={onToggle} />
    )

  return (
    <RecordDrawer.Sections storageKey={STORAGE_KEY} defaultOpen={DEFAULT_OPEN}>
      <RecordDrawer.Section
        id="details"
        title={t('contacts.preview.sections.details', { entity: record.entityTitle })}
      >
        <ContactDetailsForm
          key={contact.id}
          contact={contact}
          sources={record.sources}
          savers={record.savers}
        />
      </RecordDrawer.Section>

      <RecordDrawer.Section id="activity" title={t('contacts.preview.sections.activity')}>
        <ActivityTimeline feed={feed} onToggle={onToggle} emptyAction={record.add.note} />
      </RecordDrawer.Section>

      <RecordDrawer.Section
        id="notes"
        title={t('contacts.preview.sections.notes')}
        meta={{ count: feed.isLoading ? contact.noteCount : groups.notes.length }}
        action={record.add.note}
      >
        {listOrEmpty(groups.notes, 'contacts.preview.empty.notes', record.add.note)}
      </RecordDrawer.Section>

      <RecordDrawer.Section
        id="tasks"
        title={t('contacts.preview.sections.tasks')}
        meta={{ count: groups.tasks.length }}
        action={record.add.task}
      >
        {listOrEmpty(groups.tasks, 'contacts.preview.empty.tasks', record.add.task)}
      </RecordDrawer.Section>

      <RecordDrawer.Section
        id="meetings"
        title={t('contacts.preview.sections.meetings')}
        meta={{ count: groups.meetings.length }}
        action={record.add.meeting}
      >
        {listOrEmpty(groups.meetings, 'contacts.preview.empty.meetings', record.add.meeting)}
      </RecordDrawer.Section>

      <RecordDrawer.Section
        id="tags"
        title={t('contacts.preview.sections.tags')}
        meta={{ count: contact.tags.length }}
        action={record.add.tags}
      >
        <span className="flex flex-wrap gap-2">
          {contact.tags.map((name) => (
            <Chip key={name} color={tagsByName.get(name.toLowerCase())?.color}>
              {name}
            </Chip>
          ))}
          {record.add.tags ? (
            <Chip.Add label={t('contacts.preview.addTag')} onClick={record.add.tags.onClick} />
          ) : null}
          {!record.add.tags && contact.tags.length === 0 ? (
            <Text variant="muted">{t('contacts.preview.empty.tags')}</Text>
          ) : null}
        </span>
      </RecordDrawer.Section>

      <RecordDrawer.Section
        id="doNotContact"
        title={t('contacts.preview.sections.doNotContact')}
        meta={{
          badge:
            optedOut.length > 0 ? (
              <BadgeSoft tone="negative" size="sm">
                {optedOut.length}
              </BadgeSoft>
            ) : undefined,
        }}
      >
        {optedOut.length === 0 ? (
          <Text variant="muted">{t('contacts.preview.empty.doNotContact')}</Text>
        ) : (
          <span className="flex flex-wrap gap-1.5">
            {optedOut.map((channel) => (
              <BadgeSoft key={channel} tone="negative">
                {t(`contacts.preview.optedOut.${channel}`)}
              </BadgeSoft>
            ))}
          </span>
        )}
      </RecordDrawer.Section>
    </RecordDrawer.Sections>
  )
}
