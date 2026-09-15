'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { blankToUndefined } from '@repo/shared-utils'

import { contactFullName } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'
import { Text } from '@/shared/ui/atoms/text'
import { AsyncSelect } from '@/shared/ui/molecules/async-select'

import type { ContactListItem } from '@repo/shared-types'

const SEARCH_LIMIT = 8
const SEARCH_STALE_MS = 30_000

type MergeLoserPickerProps = {
  readonly winnerId: string
  readonly loser: ContactListItem | null
  readonly onPick: (contact: ContactListItem | null) => void
  readonly disabled?: boolean
}

export function MergeLoserPicker({
  winnerId,
  loser,
  onPick,
  disabled,
}: Readonly<MergeLoserPickerProps>) {
  const { t } = useTranslation()
  const client = useQueryClient()

  const fetcher = useCallback(
    async (term: string): Promise<ReadonlyArray<ContactListItem>> => {
      const query = { q: blankToUndefined(term.trim()), limit: SEARCH_LIMIT }
      const page = await client.fetchQuery({
        queryKey: QUERY_KEYS.contacts.list(query),
        queryFn: () => contactsService.list(query),
        staleTime: SEARCH_STALE_MS,
        retry: false,
      })
      return page.data.filter((contact) => contact.id !== winnerId)
    },
    [client, winnerId],
  )

  return (
    <AsyncSelect<ContactListItem>
      value={loser?.id ?? ''}
      onChange={(_value, contact) => onPick(contact)}
      disabled={disabled}
      source={{
        key: 'merge-contacts',
        getValue: (contact) => contact.id,
        fetcher,
        renderOption: (contact) => (
          <span className="flex min-w-0 flex-col">
            <Text variant="body" className="truncate">
              {contactFullName(contact)}
            </Text>
            <Text variant="hint" className="truncate">
              {contact.email ?? contact.phone ?? t('contacts.merge.noContactData')}
            </Text>
          </span>
        ),
      }}
      view={{
        label: t('contacts.merge.pickLoser'),
        display: loser ? contactFullName(loser) : undefined,
        placeholder: t('contacts.merge.pickLoser'),
        searchPlaceholder: t('contacts.merge.searchPlaceholder'),
        empty: t('contacts.merge.noResults'),
      }}
    />
  )
}
