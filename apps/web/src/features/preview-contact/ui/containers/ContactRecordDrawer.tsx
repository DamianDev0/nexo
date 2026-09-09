'use client'

import { useTranslation } from 'react-i18next'

import { useContactTimeline } from '@/entities/contact'
import { useTagCatalog } from '@/entities/tag'
import {
  buildRecordDrawerLabels,
  RecordDrawer,
  useRecordPager,
} from '@/shared/ui/organisms/record-drawer'

import { useContactRecord } from '../../model/useContactRecord'
import { ContactRecordHeader } from '../ContactRecordHeader'
import { ContactRecordSections } from '../ContactRecordSections'

import { ContactOwnerPicker } from './ContactOwnerPicker'

import type { ContactRowActions, ContactTaxonomyMaps } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

const contactId = (contact: ContactListItem) => contact.id

export type ContactRecordSource = {
  readonly contact: ContactListItem
  readonly siblings: ReadonlyArray<ContactListItem>
  readonly onSelect: (contact: ContactListItem) => void
}

type ContactRecordDrawerProps = {
  readonly record: ContactRecordSource
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly actions: ContactRowActions
  readonly taxonomy: ContactTaxonomyMaps
}

export function ContactRecordDrawer({
  record: source,
  open,
  onOpenChange,
  actions,
  taxonomy,
}: Readonly<ContactRecordDrawerProps>) {
  const { t } = useTranslation()
  const { contact } = source
  const labels = buildRecordDrawerLabels(t)
  const pager = useRecordPager({
    items: source.siblings,
    current: contact,
    getId: contactId,
    onSelect: source.onSelect,
    enabled: open,
  })
  const timeline = useContactTimeline(contact.id, open)
  const tagsByName = useTagCatalog('contact')
  const record = useContactRecord({ contact, taxonomy, actions })

  return (
    <RecordDrawer open={open} onOpenChange={onOpenChange} label={labels.title}>
      <RecordDrawer.Header labels={labels} pager={pager} onClose={() => onOpenChange(false)} />
      <RecordDrawer.Body page={pager?.index ?? 0}>
        <ContactRecordHeader
          record={record}
          owner={
            actions.onAssign ? (
              <ContactOwnerPicker contact={contact} onAssign={actions.onAssign} />
            ) : null
          }
        />
        <ContactRecordSections
          contact={contact}
          record={record}
          activities={{ feed: timeline, onToggle: actions.onToggleActivity }}
          tagsByName={tagsByName}
        />
      </RecordDrawer.Body>
    </RecordDrawer>
  )
}
