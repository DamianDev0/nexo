'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'

import { FilterChip } from './filter-chip'

import type { FilterFieldDef } from '../model/types'
import type { FilterCondition } from '@repo/shared-types'

type FilterChipsProps = {
  readonly fields: ReadonlyArray<FilterFieldDef>
  readonly value: ReadonlyArray<FilterCondition>
  readonly onChange: (next: ReadonlyArray<FilterCondition>) => void
  readonly className?: string
}

export function FilterChips({ fields, value, onChange, className }: Readonly<FilterChipsProps>) {
  const { t } = useTranslation()
  const fieldByKey = new Map(fields.map((field) => [field.key, field]))
  const conditions = value.filter((condition) => fieldByKey.has(condition.field))

  if (conditions.length === 0) return null

  const replace = (index: number, next: FilterCondition) => {
    onChange(conditions.map((condition, i) => (i === index ? next : condition)))
  }

  const remove = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {conditions.map((condition, index) => {
        const field = fieldByKey.get(condition.field)
        if (!field) return null
        return (
          <FilterChip
            key={`${condition.field}-${index + 1}`}
            field={field}
            condition={condition}
            onChange={(next) => replace(index, next)}
            onRemove={() => remove(index)}
          />
        )
      })}
      <PillButton
        variant="ghost"
        size="xs"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => onChange([])}
      >
        {t('common.filters.advanced.clear')}
      </PillButton>
    </div>
  )
}
