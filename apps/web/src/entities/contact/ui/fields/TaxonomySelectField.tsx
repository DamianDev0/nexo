'use client'

import { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { normalizeSearchText } from '@/shared/lib/search-text'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { AsyncSelect } from '@/shared/ui/molecules/async-select'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { AsyncSelectSource } from '@/shared/ui/molecules/async-select'
import type { Control, FieldValues, Path } from 'react-hook-form'

export type TaxonomyFieldName<T extends FieldValues> = Extract<
  Path<T>,
  'status' | 'source' | 'lifecycleStage'
>

export type TaxonomySelectView = {
  readonly placeholder?: string
  readonly compact?: boolean
  readonly disabled?: boolean
  readonly onChange?: (value: string) => void
}

type TaxonomySelectFieldProps<T extends FieldValues> = {
  readonly control: Control<T>
  readonly name: TaxonomyFieldName<T>
  readonly label: string
  readonly choices: ReadonlyArray<TaxonomyChoice>
  readonly view?: TaxonomySelectView
}

function renderChoice(choice: TaxonomyChoice) {
  return (
    <span className="flex items-center gap-2">
      <ColorDot color={choice.color} />
      {choice.label}
    </span>
  )
}

export function TaxonomySelectField<T extends FieldValues>({
  control,
  name,
  label,
  choices,
  view,
}: Readonly<TaxonomySelectFieldProps<T>>) {
  const { t } = useTranslation()

  const source = useMemo<AsyncSelectSource<TaxonomyChoice>>(
    () => ({
      options: choices,
      getValue: (choice) => choice.key,
      renderOption: renderChoice,
      filterFn: (choice, query) => normalizeSearchText(choice.label).includes(query),
    }),
    [choices],
  )

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected = choices.find((choice) => choice.key === field.value)
        return (
          <div>
            <FieldLabel>{label}</FieldLabel>
            <div className={view?.compact ? 'mt-1' : 'mt-1.5'}>
              <AsyncSelect
                value={String(field.value ?? '')}
                disabled={view?.disabled}
                onChange={(value) => {
                  field.onChange(value)
                  view?.onChange?.(value)
                }}
                source={source}
                view={{
                  display: selected ? renderChoice(selected) : undefined,
                  placeholder: view?.placeholder ?? '',
                  searchPlaceholder: t('common.search'),
                  empty: t('common.noResults'),
                }}
              />
            </div>
          </div>
        )
      }}
    />
  )
}
