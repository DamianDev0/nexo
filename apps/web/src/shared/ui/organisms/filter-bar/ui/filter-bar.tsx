'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'

import { defaultOperator } from '../lib/conditions'

import { AddFilter } from './add-filter'
import { FilterChip } from './filter-chip'

import type { FilterBarProps, FilterFieldDef } from '../model/types'
import type { FilterCondition } from '@repo/shared-types'

export function FilterBar({ fields, value, onChange, className }: Readonly<FilterBarProps>) {
  const { t } = useTranslation()

  const fieldByKey = new Map(fields.map((field) => [field.key, field]))
  const conditions = value.filter((condition) => fieldByKey.has(condition.field))

  const add = (field: FilterFieldDef) => {
    onChange([...conditions, { field: field.key, operator: defaultOperator(field.type) }])
  }

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

      <AddFilter fields={fields} onPick={add} showLabel={conditions.length === 0} />

      {conditions.length > 0 && (
        <PillButton
          variant="ghost"
          size="xs"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onChange([])}
        >
          {t('common.filters.advanced.clear')}
        </PillButton>
      )}
    </div>
  )
}
