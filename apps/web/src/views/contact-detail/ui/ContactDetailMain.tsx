'use client'

import { useTranslation } from 'react-i18next'

import { ActivityTimeline, ContactDetailsForm } from '@/features/preview-contact'
import { SegmentedControl } from '@/shared/ui/molecules/segmented-control'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'

import { DETAIL_TABS } from '../config/detail-panels.constants'

import type { DetailTabId } from '../config/detail-panels.constants'
import type { ContactTimelineFeed } from '@/entities/contact'
import type { ContactRecord } from '@/features/preview-contact'
import type { ContactActivity, ContactListItem } from '@repo/shared-types'

type ContactDetailMainProps = {
  readonly contact: ContactListItem
  readonly record: ContactRecord
  readonly tabs: { readonly active: DetailTabId; readonly select: (tab: DetailTabId) => void }
  readonly activities: {
    readonly feed: ContactTimelineFeed
    readonly onToggle?: (activity: ContactActivity) => void
  }
}

export function ContactDetailMain({
  contact,
  record,
  tabs,
  activities,
}: Readonly<ContactDetailMainProps>) {
  const { t } = useTranslation()
  const options = DETAIL_TABS.map((id) => ({ value: id, label: t(`contacts.detail.tabs.${id}`) }))

  return (
    <RecordLayout.Main>
      <RecordLayout.Tabs>
        <SegmentedControl
          value={tabs.active}
          onValueChange={tabs.select}
          options={options}
          className="w-full max-w-sm"
        />
      </RecordLayout.Tabs>
      <RecordLayout.Content className="mx-auto w-full max-w-2xl">
        {tabs.active === 'details' ? (
          <ContactDetailsForm
            key={contact.id}
            contact={contact}
            sources={record.sources}
            savers={record.savers}
          />
        ) : (
          <ActivityTimeline
            feed={activities.feed}
            onToggle={activities.onToggle}
            emptyAction={record.add.note}
          />
        )}
      </RecordLayout.Content>
    </RecordLayout.Main>
  )
}
