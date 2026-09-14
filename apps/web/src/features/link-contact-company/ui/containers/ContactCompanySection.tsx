'use client'

import { useTranslation } from 'react-i18next'

import { CompanyCard, otherCompanyContacts, useCompanySummary } from '@/entities/company'
import { Text } from '@/shared/ui/atoms/text'
import { LinkBreakIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { useLinkContactCompany } from '../../query/useLinkContactCompany'
import { CompanyContactList } from '../CompanyContactList'
import { ContactCompanyEmpty } from '../ContactCompanyEmpty'

import { ContactCompanyPicker } from './ContactCompanyPicker'

type ContactCompanySectionProps = {
  readonly contactId: string
  readonly companyId: string | null
}

export function ContactCompanySection({
  contactId,
  companyId,
}: Readonly<ContactCompanySectionProps>) {
  const { t } = useTranslation()
  const { company, isLoading, isError } = useCompanySummary(companyId)
  const { link, unlink, isPending } = useLinkContactCompany(contactId)

  if (isLoading) return <Skeleton className="h-28 w-full rounded-xl" />

  if (isError) return <Text variant="muted">{t('contacts.company.error')}</Text>

  if (!company) {
    return (
      <ContactCompanyEmpty picker={<ContactCompanyPicker onPick={link} disabled={isPending} />} />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <CompanyCard
        company={company}
        action={
          <HintTooltip asChild hint={t('contacts.company.unlink')}>
            <HeaderIconButton
              aria-label={t('contacts.company.unlink')}
              disabled={isPending}
              onClick={() => unlink(company.id)}
            >
              <LinkBreakIcon />
            </HeaderIconButton>
          </HintTooltip>
        }
      />
      <CompanyContactList contacts={otherCompanyContacts(company.contacts, contactId)} />
    </div>
  )
}
