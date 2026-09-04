'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  contactDialNumber,
  contactFullName,
  contactInitials,
  contactPhoneLabel,
  useContactList,
} from '@/entities/contact'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { AddressBookIcon } from '@/shared/ui/icons'
import { SearchInput } from '@/shared/ui/molecules/search-input'

import { DIALER_LIMITS } from '../../config/dialer.config'
import { contactNumber } from '../../lib/contact-number'
import { DockEmpty } from '../DockEmpty'

type ContactsTabProps = {
  readonly onCall: (number: string) => void
}

export function ContactsTab({ onCall }: Readonly<ContactsTabProps>) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search)
  const { data } = useContactList({ q: query, page: 1, limit: DIALER_LIMITS.contactResults })
  const contacts = data?.data ?? []

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-3 py-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('dialer.searchContacts')}
          classes={{ input: 'h-9' }}
        />
      </div>
      {contacts.length === 0 ? (
        <DockEmpty
          icon={<AddressBookIcon className="size-7" />}
          label={t('dialer.contactsEmpty')}
        />
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {contacts.map((contact) => {
            const number = contactNumber(contact)
            return (
              <li key={contact.id} className="border-b border-border/60 last:border-b-0">
                <PillButton
                  variant="ghost"
                  size="sm"
                  disabled={number === null}
                  onClick={() => number !== null && onCall(contactDialNumber(number))}
                  className="h-14 w-full justify-start gap-3 rounded-none px-4"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Text variant="emphasis">{contactInitials(contact)}</Text>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                    <Text variant="strong" className="max-w-full truncate">
                      {contactFullName(contact)}
                    </Text>
                    <Text variant="hint" className="tabular-nums">
                      {number === null ? t('dialer.noPhone') : contactPhoneLabel(number)}
                    </Text>
                  </span>
                </PillButton>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
