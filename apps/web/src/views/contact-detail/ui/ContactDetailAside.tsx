'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { ContactOwnerPicker, ContactRecordHeader } from '@/features/preview-contact'
import { ROUTES } from '@/shared/config/routes'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { CaretLeftIcon } from '@/shared/ui/icons'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'
import { RecordLayout } from '@/shared/ui/organisms/record-layout'

import type { ContactRowActions } from '@/entities/contact'
import type { ContactRecord } from '@/features/preview-contact'
import type { ContactListItem } from '@repo/shared-types'

type ContactDetailAsideProps = {
  readonly contact: ContactListItem
  readonly record: ContactRecord
  readonly onAssign: ContactRowActions['onAssign']
}

export function ContactDetailAside({
  contact,
  record,
  onAssign,
}: Readonly<ContactDetailAsideProps>) {
  const { t } = useTranslation()

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
      <RecordDrawer.Sections defaultOpen={['summary']}>
        <RecordDrawer.Section id="summary" title={t('contacts.detail.summary')}>
          <RecordDrawer.Fields rows={record.rows} />
        </RecordDrawer.Section>
      </RecordDrawer.Sections>
    </RecordLayout.Aside>
  )
}
