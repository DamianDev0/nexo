'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { AsyncSelect } from '@/shared/ui/molecules/async-select'

import { choiceSource, isChoiceSearchable } from '../../lib/choice-source'

import type { ChoiceOption } from '../../lib/choice-source'
import type { ReactNode } from 'react'

export type { ChoiceOption } from '../../lib/choice-source'

export type ChoiceCellSelection = {
  readonly value: string | null
  readonly options: ReadonlyArray<ChoiceOption>
  readonly onChange?: (value: string | null) => void
  readonly clearLabel?: string
}

type ContactChoiceCellProps = {
  readonly label: string
  readonly selection: ChoiceCellSelection
  readonly children: ReactNode
}

function renderOption(option: ChoiceOption) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {option.color ? <ColorDot color={option.color} /> : null}
      <span className="truncate">{option.label}</span>
    </span>
  )
}

export function ContactChoiceCell({
  label,
  selection,
  children,
}: Readonly<ContactChoiceCellProps>) {
  const { t } = useTranslation()
  const { value, options, onChange, clearLabel } = selection
  const source = useMemo(() => choiceSource(options, renderOption), [options])

  if (!onChange || options.length === 0) return <>{children}</>

  return (
    <AsyncSelect
      value={value ?? ''}
      onChange={(key) => onChange(key === '' ? null : key)}
      source={source}
      view={{
        label,
        display: children,
        placeholder: '',
        searchable: isChoiceSearchable(options),
        searchPlaceholder: t('common.search'),
        empty: t('common.noResults'),
        clear: clearLabel,
        compact: true,
      }}
    />
  )
}
