'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { AsyncSelect } from '@/shared/ui/molecules/async-select'

import { useMunicipalityFetcher } from '../../query/useMunicipalityFetcher'

import type { AsyncSelectSource } from '@/shared/ui/molecules/async-select'
import type { Municipality } from '@repo/shared-types'

const MIN_TERM_LENGTH = 2

interface MunicipalityComboboxProps {
  readonly value: string
  readonly onSelect: (municipality: { code: string; name: string; department: string }) => void
  readonly placeholder?: string
  readonly triggerClassName?: string
  readonly label?: string
}

function renderMunicipality(municipality: Municipality) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <span className="truncate">{municipality.name}</span>
      <Text variant="hint" className="ml-auto shrink-0">
        {municipality.department}
      </Text>
    </span>
  )
}

export function MunicipalityComboboxContainer({
  value,
  onSelect,
  placeholder,
  triggerClassName,
  label,
}: Readonly<MunicipalityComboboxProps>) {
  const { t } = useTranslation()
  const fetcher = useMunicipalityFetcher()

  const source = useMemo<AsyncSelectSource<Municipality>>(
    () => ({
      key: 'municipalities',
      fetcher,
      getValue: (municipality) => municipality.name,
      renderOption: renderMunicipality,
    }),
    [fetcher],
  )

  return (
    <AsyncSelect
      value={value}
      onChange={(_, municipality) => {
        if (municipality) onSelect(municipality)
      }}
      source={source}
      view={{
        label: label ?? t('contacts.form.city'),
        display: value || undefined,
        placeholder: placeholder ?? '',
        searchPlaceholder: t('common.search'),
        empty: (term) =>
          term.trim().length < MIN_TERM_LENGTH ? t('geo.typeToSearch') : t('geo.noMatches'),
        error: t('geo.loadFailed'),
        triggerClassName,
      }}
    />
  )
}
