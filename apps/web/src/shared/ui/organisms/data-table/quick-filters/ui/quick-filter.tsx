'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { CaretDownIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { GROOVY_ITEM, GROOVY_ITEM_IDLE } from '@/shared/ui/molecules/groovy-popover/constants'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { OptionRow } from './option-row'

import type { QuickFilterDef } from '../model/types'

interface QuickFilterProps {
  readonly filter: QuickFilterDef
  readonly onToggle: (value: string) => void
  readonly onClear: () => void
}

function summarize(filter: QuickFilterDef): string | null {
  if (filter.selected.length === 0) return null
  if (filter.selected.length > 1) return `+${filter.selected.length}`
  return filter.options.find((option) => option.value === filter.selected[0])?.label ?? null
}

export function QuickFilter({ filter, onToggle, onClear }: Readonly<QuickFilterProps>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const active = filter.selected.length > 0
  const summary = summarize(filter)

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Anchor asChild>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={cn(
            'flex h-8 shrink-0 items-center gap-1.5 px-1.5 text-sm transition-colors duration-200',
            active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <span className="font-medium">{filter.label}</span>
          {summary && (
            <span className="max-w-28 truncate font-semibold tabular-nums text-primary-deep dark:text-primary">
              {summary}
            </span>
          )}
          <CaretDownIcon
            className={cn(
              'size-3 shrink-0 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
      </GroovyPopover.Anchor>

      <GroovyPopover.Content align="end" className="w-64">
        <TooltipProvider delayDuration={350}>
          <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filter.options.map((option) => (
              <OptionRow
                key={option.value}
                option={option}
                checked={filter.selected.includes(option.value)}
                onToggle={() => onToggle(option.value)}
              />
            ))}
          </div>
        </TooltipProvider>

        {active && (
          <button
            type="button"
            onClick={onClear}
            className={cn(GROOVY_ITEM, GROOVY_ITEM_IDLE, 'mt-1 text-xs')}
          >
            {t('common.filters.clearOne')}
          </button>
        )}
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
