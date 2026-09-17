'use client'

import { useTranslation } from 'react-i18next'

import { ArchiveRecordDialog } from '@/features/archive-record'
import { ContactComposerHost } from '@/features/compose-contact-actions'
import { MergeContactsDialog } from '@/features/merge-contacts'
import { useContactRecord } from '@/features/preview-contact'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'
import { useBreadcrumbTail } from '@/widgets/app-shell'

import { ContactDetailAside } from './ContactDetailAside'
import { ContactDetailMain } from './ContactDetailMain'
import { ContactDetailPanels } from './ContactDetailPanels'

import type { ContactDetail } from '../model/useContactDetail'
import type { ContactListItem } from '@repo/shared-types'

type ContactDetailLoadedProps = {
  readonly contact: ContactListItem
  readonly detail: ContactDetail
}

export function ContactDetailLoaded({ contact, detail }: Readonly<ContactDetailLoadedProps>) {
  const {
    taxonomy,
    actions,
    activities,
    deals,
    tagsByName,
    composers,
    rail,
    archive,
    mergeDialog,
    panelRoute,
    tabs,
  } = detail
  const { t } = useTranslation()
  const record = useContactRecord({ contact, taxonomy, actions })
  useBreadcrumbTail(record.name)

  return (
    <RecordLayout panel={panelRoute.panel} onPanelChange={panelRoute.onPanelChange}>
      <h1 className="sr-only">{record.name}</h1>
      <ContactDetailAside
        contact={contact}
        record={record}
        tagsByName={tagsByName}
        onAssign={actions.onAssign}
      />
      <ContactDetailMain contact={contact} record={record} tabs={tabs} activities={activities} />
      <ContactDetailPanels activities={activities} add={record.add} deals={deals} />
      <RecordLayout.Rail items={rail} label={t('contacts.detail.rail')} />
      <ArchiveRecordDialog state={archive} />
      <MergeContactsDialog winner={contact} state={mergeDialog} />
      <ContactComposerHost composers={composers} />
    </RecordLayout>
  )
}
