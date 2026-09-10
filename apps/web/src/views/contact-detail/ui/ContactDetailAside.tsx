'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { ContactOwnerPicker, ContactRecordHeader } from '@/features/preview-contact'
import { ROUTES } from '@/shared/config/routes'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { Chip } from '@/shared/ui/atoms/chip'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CaretLeftIcon } from '@/shared/ui/icons'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'

import { buildAttributionRows } from '../lib/build-attribution-rows'

import type { ContactRowActions } from '@/entities/contact'
import type { ContactRecord } from '@/features/preview-contact'
import type { ContactListItem, Tag } from '@repo/shared-types'

type ContactDetailAsideProps = {
  readonly contact: ContactListItem
  readonly record: ContactRecord
  readonly tagsByName: ReadonlyMap<string, Tag>
  readonly onAssign: ContactRowActions['onAssign']
}

export function ContactDetailAside({
  contact,
  record,
  tagsByName,
  onAssign,
}: Readonly<ContactDetailAsideProps>) {
  const { t, i18n } = useTranslation()
  const optedOut = contact.optedOutChannels

  return (
    <RecordLayout.Aside>
      <div className="px-3 pt-3">
        <PillButton asChild variant="ghost" size="xs" className="px-2 font-medium">
          <Link href={ROUTES.app.contacts.list}>
            <CaretLeftIcon className="size-4" />
            {t('contacts.detail.back')}
          </Link>
        </PillButton>
      </div>
      <ContactRecordHeader
        record={record}
        owner={onAssign ? <ContactOwnerPicker contact={contact} onAssign={onAssign} /> : null}
      />
      <RecordDrawer.Sections defaultOpen={['attribution']}>
        <RecordDrawer.Section
          id="tags"
          title={t('contacts.detail.sections.tags')}
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

        <RecordDrawer.Section id="attribution" title={t('contacts.detail.sections.attribution')}>
          <RecordDrawer.Fields rows={buildAttributionRows(t, contact, i18n.language)} />
        </RecordDrawer.Section>

        <RecordDrawer.Section
          id="doNotContact"
          title={t('contacts.detail.sections.doNotContact')}
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
    </RecordLayout.Aside>
  )
}
