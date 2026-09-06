'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  contactAvatarUrl,
  contactDialNumber,
  contactFullName,
  contactInitials,
  useContactList,
} from '@/entities/contact'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { Avatar } from '@/shared/ui/atoms/avatar'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { AddressBookIcon, PhoneIcon, WarningCircleIcon } from '@/shared/ui/icons'
import { ActionDock } from '@/shared/ui/molecules/action-dock'
import { SearchInput } from '@/shared/ui/molecules/search-input'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { DIALER_LIMITS } from '../../config/dialer.config'
import { contactNumber } from '../../lib/contact-number'
import { groupContactsByInitial } from '../../lib/group-contacts'
import { DockEmpty } from '../DockEmpty'

import type { ContactListItem } from '@repo/shared-types'

const skeletonRows = ['sk-a', 'sk-b', 'sk-c', 'sk-d', 'sk-e', 'sk-f', 'sk-g']

function ContactRow({
  contact,
  onCall,
}: Readonly<{ contact: ContactListItem; onCall: (number: string, name?: string) => void }>) {
  const { t } = useTranslation()
  const number = contactNumber(contact)
  const name = contactFullName(contact)
  return (
    <div className="group relative flex h-12 items-center gap-2.5 px-4 transition-colors hover:bg-muted/60">
      <Avatar size="sm" variant="soft" className="size-7 shrink-0 rounded-full">
        <Avatar.Image src={contactAvatarUrl(contact)} alt="" className="bg-muted" />
        <Avatar.Fallback aria-label={name} className="bg-muted">
          {contactInitials(contact)}
        </Avatar.Fallback>
      </Avatar>
      <TruncateTip className="min-w-0 flex-1 text-sm font-medium text-foreground">
        {name}
      </TruncateTip>
      {number === null ? null : (
        <span className="opacity-0 transition-opacity duration-120 group-hover:opacity-100 focus-within:opacity-100">
          <ActionDock
            label={t('dialer.call')}
            items={[
              {
                id: 'call',
                label: t('dialer.call'),
                icon: <PhoneIcon />,
                onClick: () => onCall(contactDialNumber(number), name),
              },
            ]}
          />
        </span>
      )}
    </div>
  )
}

function ContactsLoading() {
  return (
    <div className="flex flex-col gap-1 pt-2">
      {skeletonRows.map((id) => (
        <div key={id} className="flex h-11 items-center gap-2.5 px-4">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-3.5 w-40 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function ContactsTab({
  onCall,
}: Readonly<{ onCall: (number: string, name?: string) => void }>) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search)
  const { data, isLoading, isError, refetch } = useContactList({
    q: query,
    page: 1,
    limit: DIALER_LIMITS.contactResults,
  })
  const groups = groupContactsByInitial(data?.data ?? [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center px-4 pt-2.5 pb-1">
        <Text className="text-sm font-bold">{t('dialer.tabs.contacts')}</Text>
      </div>
      <div className="shrink-0 border-b border-border px-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('dialer.searchContacts')}
          classes={{
            icon: 'left-0',
            input:
              'h-10 rounded-none border-0 bg-transparent px-0 pl-6.5 shadow-none focus-visible:ring-0 md:text-sm dark:bg-transparent',
          }}
        />
      </div>
      {isLoading ? <ContactsLoading /> : null}
      {isError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <WarningCircleIcon className="size-7 text-muted-foreground" />
          <Text variant="muted">{t('errors.serverTitle')}</Text>
          <PillButton variant="outline" size="xs" onClick={() => void refetch()}>
            {t('errors.retry')}
          </PillButton>
        </div>
      ) : null}
      {!isLoading && !isError && groups.length === 0 ? (
        <DockEmpty
          icon={<AddressBookIcon className="size-7" />}
          label={t('dialer.contactsEmpty')}
        />
      ) : null}
      {!isLoading && !isError && groups.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          {groups.map((group) => (
            <section key={group.letter}>
              <Text as="p" variant="caption" className="flex h-6 items-center bg-muted px-4">
                {group.letter}
              </Text>
              {group.contacts.map((contact) => (
                <ContactRow key={contact.id} contact={contact} onCall={onCall} />
              ))}
            </section>
          ))}
        </div>
      ) : null}
    </div>
  )
}
