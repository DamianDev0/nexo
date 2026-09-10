'use client'

import { useContactRecord } from '@/features/preview-contact'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'

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

  return (
    <RecordLayout defaultPanel={defaultPanel}>
      <ContactDetailAside contact={contact} record={record} onAssign={actions.onAssign} />
      <ContactDetailMain contact={contact} record={record} tabs={tabs} />
      <ContactDetailPanels contact={contact} activities={activities} tagsByName={tagsByName} />
      <RecordLayout.Rail items={rail} />
    </RecordLayout>
  )
}
