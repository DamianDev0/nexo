'use client'

import { useTranslation } from 'react-i18next'

import { companySearchLabel, useCompanyFetcher } from '@/entities/company'
import { Text } from '@/shared/ui/atoms/text'
import { AsyncSelect } from '@/shared/ui/molecules/async-select'

import type { CompanyListItem } from '@repo/shared-types'

type ContactCompanyPickerProps = {
  readonly onPick: (companyId: string) => void
  readonly disabled?: boolean
}

export function ContactCompanyPicker({ onPick, disabled }: Readonly<ContactCompanyPickerProps>) {
  const { t } = useTranslation()
  const fetcher = useCompanyFetcher()

  return (
    <AsyncSelect<CompanyListItem>
      value=""
      onChange={onPick}
      disabled={disabled}
      source={{
        key: 'companies',
        getValue: (company) => company.id,
        fetcher,
        renderOption: (company) => (
          <span className="flex min-w-0 flex-col">
            <Text variant="body" className="truncate">
              {company.name}
            </Text>
            <Text variant="hint" className="truncate">
              {companySearchLabel(company)}
            </Text>
          </span>
        ),
      }}
      view={{
        label: t('contacts.company.link'),
        placeholder: t('contacts.company.link'),
        searchPlaceholder: t('contacts.company.search'),
        empty: t('contacts.company.noResults'),
      }}
    />
  )
}
