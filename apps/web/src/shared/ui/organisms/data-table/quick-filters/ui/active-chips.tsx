'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { XIcon } from '@/shared/ui/icons'

import type { QuickFilterDef } from '../model/types'

interface ActiveChip {
  readonly filterId: string
  readonly value: string
  readonly filterLabel: string
  readonly valueLabel: string
}

interface ActiveChipsProps {
  readonly filters: ReadonlyArray<QuickFilterDef>
  readonly onRemove: (filterId: string, value: string) => void
  readonly onClearAll: () => void
}

const CHIP_IN = { opacity: 1, scale: 1 }
const CHIP_OUT = { opacity: 0, scale: 0.85 }

function toChips(filters: ReadonlyArray<QuickFilterDef>): ReadonlyArray<ActiveChip> {
  return filters.flatMap((filter) =>
    filter.selected.map((value) => ({
      filterId: filter.id,
      value,
      filterLabel: filter.label,
      valueLabel: filter.options.find((option) => option.value === value)?.label ?? value,
    })),
  )
}

export function ActiveChips({ filters, onRemove, onClearAll }: Readonly<ActiveChipsProps>) {
  const { t } = useTranslation()
  const transition = useReducedTransition(quickEase)
  const chips = toChips(filters)

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.span
            key={`${chip.filterId}:${chip.value}`}
            layout
            initial={CHIP_OUT}
            animate={CHIP_IN}
            exit={CHIP_OUT}
            transition={transition}
            className="flex h-7 max-w-56 items-center gap-1.5 rounded-full bg-muted pl-2.5 pr-1 text-xs"
          >
            <span className="truncate text-muted-foreground">{chip.filterLabel}</span>
            <span className="truncate font-semibold text-foreground">{chip.valueLabel}</span>
            <button
              type="button"
              aria-label={t('common.filters.removeOne', { value: chip.valueLabel })}
              onClick={() => onRemove(chip.filterId, chip.value)}
              className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>

      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="h-7 shrink-0 rounded-full px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {t('common.filters.clearAll', { count: chips.length })}
        </button>
      )}
    </div>
  )
}
