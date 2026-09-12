'use client'

import { useTranslation } from 'react-i18next'

import { companySearchLabel } from '@/entities/company'
import companiesService from '@/shared/api/services/companies.service'
import { Text } from '@/shared/ui/atoms/text'
import { AsyncSelect } from '@/shared/ui/molecules/async-select'

import type { CompanyListItem } from '@repo/shared-types'

const SEARCH_LIMIT = 8

type ContactCompanyPickerProps = {
  readonly onPick: (companyId: string) => void
  readonly disabled?: boolean
}

async function searchCompanies(term: string): Promise<ReadonlyArray<CompanyListItem>> {
  const page = await companiesService.list({ q: term || undefined, limit: SEARCH_LIMIT })
  return page.data
}

export function ContactCompanyPicker({ onPick, disabled }: Readonly<ContactCompanyPickerProps>) {
  const { t } = useTranslation()

  return (
    <AsyncSelect<CompanyListItem>
      value=""
      onChange={(companyId) => onPick(companyId)}
      disabled={disabled}
      source={{
        key: 'companies',
        getValue: (company) => company.id,
        fetcher: searchCompanies,
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
