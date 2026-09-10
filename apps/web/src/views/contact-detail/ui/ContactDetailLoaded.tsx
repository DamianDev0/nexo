'use client'

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
  const { taxonomy, actions, activities, tagsByName, rail, defaultPanel, tabs } = detail
  const record = useContactRecord({ contact, taxonomy, actions })
  useBreadcrumbTail(record.name)

  return (
    <RecordLayout defaultPanel={defaultPanel}>
      <ContactDetailAside
        contact={contact}
        record={record}
        tagsByName={tagsByName}
        onAssign={actions.onAssign}
      />
      <ContactDetailMain contact={contact} record={record} tabs={tabs} activities={activities} />
      <ContactDetailPanels activities={activities} />
      <RecordLayout.Rail items={rail} />
    </RecordLayout>
  )
}
