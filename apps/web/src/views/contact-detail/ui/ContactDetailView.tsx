'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { ROUTES } from '@/shared/config/routes'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { AddressBookIcon, WarningIcon } from '@/shared/ui/icons'
import { EmptyState } from '@/shared/ui/organisms/empty-state'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { useContactDetail } from '../model/useContactDetail'

import { ContactDetailLoaded } from './ContactDetailLoaded'

type ContactDetailViewProps = {
  readonly contactId: string
}

export function ContactDetailView({ contactId }: Readonly<ContactDetailViewProps>) {
  const { t } = useTranslation()
  const detail = useContactDetail(contactId)

  if (detail.isPending) {
    return (
      <div className="flex min-h-0 flex-1 gap-px bg-border">
        <Skeleton className="h-full w-90 rounded-none" />
        <Skeleton className="h-full flex-1 rounded-none" />
      </div>
    )
  }

  if (detail.isError) {
    return (
      <EmptyState
        fill
        icon={<WarningIcon className="size-5" />}
        title={t('contacts.detail.error.title')}
        description={t('contacts.detail.notFound.description')}
      >
        <PillButton size="sm" onClick={detail.retry}>
          {t('contacts.detail.error.action')}
        </PillButton>
      </EmptyState>
    )
  }

  if (!detail.contact) {
    return (
      <EmptyState
        fill
        icon={<AddressBookIcon className="size-5" />}
        title={t('contacts.detail.notFound.title')}
        description={t('contacts.detail.notFound.description')}
      >
        <PillButton asChild size="sm">
          <Link href={ROUTES.app.contacts.list}>{t('contacts.detail.notFound.action')}</Link>
        </PillButton>
      </EmptyState>
    )
  }

  return <ContactDetailLoaded contact={detail.contact} detail={detail} />
}
