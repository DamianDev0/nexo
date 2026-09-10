'use client'

import { useTranslation } from 'react-i18next'

import { ContactDetailsForm } from '@/features/preview-contact'
import { Text } from '@/shared/ui/atoms/text'
import { SegmentedControl } from '@/shared/ui/molecules/segmented-control'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'

import { DETAIL_TABS } from '../config/detail-panels.constants'
import { buildEngagementRows } from '../lib/build-engagement-rows'

import type { DetailTabId } from '../config/detail-panels.constants'
import type { ContactRecord } from '@/features/preview-contact'
import type { ContactListItem } from '@repo/shared-types'

type ContactDetailMainProps = {
  readonly contact: ContactListItem
  readonly record: ContactRecord
  readonly tabs: { readonly active: DetailTabId; readonly select: (tab: DetailTabId) => void }
}

export function ContactDetailMain({ contact, record, tabs }: Readonly<ContactDetailMainProps>) {
  const { t, i18n } = useTranslation()
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
      <RecordLayout.Content>
        {tabs.active === 'details' ? (
          <ContactDetailsForm
            key={contact.id}
            contact={contact}
            sources={record.sources}
            savers={record.savers}
          />
        ) : (
          <>
            <Text variant="muted">{t('contacts.detail.tabs.engagement')}</Text>
            <RecordDrawer.Fields rows={buildEngagementRows(t, contact, i18n.language)} />
          </>
        )}
      </RecordLayout.Content>
    </RecordLayout.Main>
  )
}
