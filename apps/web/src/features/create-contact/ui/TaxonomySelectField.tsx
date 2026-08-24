'use client'

import { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { AsyncSelect } from '@/shared/ui/molecules/async-select'

import type { ContactFormValues } from '../lib/contact-form.schema'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { AsyncSelectSource } from '@/shared/ui/molecules/async-select'
import type { Control } from 'react-hook-form'

interface TaxonomySelectFieldProps {
  readonly control: Control<ContactFormValues>
  readonly name: 'status' | 'source' | 'type' | 'lifecycleStage'
  readonly label: string
  readonly placeholder?: string
  readonly choices: ReadonlyArray<TaxonomyChoice>
}

function renderChoice(choice: TaxonomyChoice) {
  return (
    <span className="flex items-center gap-2">
      <ColorDot color={choice.color} />
      {choice.label}
    </span>
  )
}

export function TaxonomySelectField({
  control,
  name,
  label,
  placeholder,
  choices,
}: Readonly<TaxonomySelectFieldProps>) {
  const { t } = useTranslation()

  const source = useMemo<AsyncSelectSource<TaxonomyChoice>>(
    () => ({
      options: choices,
      getValue: (choice) => choice.key,
      renderOption: renderChoice,
      filterFn: (choice, query) => choice.label.toLowerCase().includes(query.toLowerCase()),
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
            <div className="mt-1.5">
              <AsyncSelect
                value={field.value}
                onChange={(value) => field.onChange(value)}
                source={source}
                view={{
                  display: selected ? renderChoice(selected) : undefined,
                  placeholder: placeholder ?? '',
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
