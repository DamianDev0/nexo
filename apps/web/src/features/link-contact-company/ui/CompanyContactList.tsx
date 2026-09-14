'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { contactFullName } from '@/entities/contact'
import { ROUTES } from '@/shared/config/routes'
import { Text } from '@/shared/ui/atoms/text'
import { RecordCard } from '@/shared/ui/molecules/record-card'

import type { CompanyContactItem } from '@repo/shared-types'

type CompanyContactListProps = {
  readonly contacts: ReadonlyArray<CompanyContactItem>
}

export function CompanyContactList({ contacts }: Readonly<CompanyContactListProps>) {
  const { t } = useTranslation()

  if (contacts.length === 0) return null

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <Text variant="kicker">{t('contacts.company.colleagues', { count: contacts.length })}</Text>
      <RecordCard.List divided>
        {contacts.map((contact) => (
          <RecordCard.Row key={contact.id}>
            <Link
              href={ROUTES.app.contacts.detail(contact.id)}
              className="flex min-w-0 flex-1 flex-col rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Text variant="body" className="truncate">
                {contactFullName(contact)}
              </Text>
              {contact.email ? (
                <Text variant="hint" className="truncate">
                  {contact.email}
                </Text>
              ) : null}
            </Link>
          </RecordCard.Row>
        ))}
      </RecordCard.List>
    </div>
  )
}
