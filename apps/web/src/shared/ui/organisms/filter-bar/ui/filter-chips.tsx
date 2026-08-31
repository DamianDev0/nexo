'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { useReducedTransition } from '@/shared/lib/animations'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { SPRING_SNAPPY } from '@/shared/ui/smoothui/lib/animation'

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
  const transition = useReducedTransition(SPRING_SNAPPY)
  const fieldByKey = new Map(fields.map((field) => [field.key, field]))
  const conditions = value.filter((condition) => fieldByKey.has(condition.field))

  const replace = (index: number, next: FilterCondition) => {
    onChange(conditions.map((condition, i) => (i === index ? next : condition)))
  }

  const remove = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {conditions.map((condition, index) => {
          const field = fieldByKey.get(condition.field)
          if (!field) return null
          return (
            <motion.span
              key={`${condition.field}-${index + 1}`}
              layout
              initial={{ opacity: 0, scale: 0.85, x: -6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: -6 }}
              transition={transition}
              className="shrink-0"
            >
              <FilterChip
                field={field}
                condition={condition}
                onChange={(next) => replace(index, next)}
                onRemove={() => remove(index)}
              />
            </motion.span>
          )
        })}
        {conditions.length > 0 && (
          <motion.span
            key="clear-filters"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="shrink-0"
          >
            <PillButton
              variant="ghost"
              size="xs"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange([])}
            >
              {t('common.filters.advanced.clear')}
            </PillButton>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
