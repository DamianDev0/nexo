'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { CaretDownIcon, MagnifyingGlassIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { GROOVY_ITEM, GROOVY_ITEM_IDLE } from '@/shared/ui/molecules/groovy-popover/constants'
import { Button } from '@/shared/ui/shadcn/button'
import { Command, CommandEmpty, CommandList } from '@/shared/ui/shadcn/command'
import { SmoothInput } from '@/shared/ui/smoothui/input'

import { OptionRow } from './option-row'

import type { QuickFilterDef } from '../model/types'

const SEARCH_THRESHOLD = 8

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

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[̀-ͯ]/g, '')
}

export function QuickFilter({ filter, onToggle, onClear }: Readonly<QuickFilterProps>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [highlighted, setHighlighted] = useState('')
  const active = filter.selected.length > 0
  const summary = summarize(filter)
  const searchable = filter.options.length > SEARCH_THRESHOLD
  const visible = term
    ? filter.options.filter((option) => normalize(option.label).includes(normalize(term)))
    : filter.options
  const highlightedValue = visible.some((option) => option.value === highlighted)
    ? highlighted
    : (visible[0]?.value ?? '')

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setTerm('')
      setHighlighted('')
    }
  }

  return (
    <GroovyPopover open={open} onOpenChange={onOpenChange}>
      <GroovyPopover.Anchor asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={open}
          onClick={() => onOpenChange(!open)}
          className={cn(
            'h-8 gap-1.5 px-1.5 text-sm font-normal transition-colors duration-200 hover:bg-transparent',
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
        </Button>
      </GroovyPopover.Anchor>

      <GroovyPopover.Content align="end" autoFocusContent className="w-64 p-0">
        <Command shouldFilter={false} value={highlightedValue} onValueChange={setHighlighted}>
          {searchable && (
            <div className="relative border-b border-border">
              <MagnifyingGlassIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <SmoothInput
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={t('common.filters.searchOption')}
                className="h-9 rounded-b-none border-none pl-8.5 focus-visible:ring-0"
              />
            </div>
          )}
          <CommandList className="max-h-49 scroll-py-1.5 p-1.5 scroll-smooth scrollbar-hidden **:[[cmdk-list-sizer]]:space-y-1">
            <CommandEmpty className="px-2.5 py-4 text-center text-sm text-muted-foreground">
              {t('common.noResults')}
            </CommandEmpty>
            {visible.map((option) => (
              <OptionRow
                key={option.value}
                option={option}
                checked={filter.selected.includes(option.value)}
                onToggle={() => onToggle(option.value)}
              />
            ))}
          </CommandList>

          {active && (
            <div className="border-t border-border p-1">
              <Button
                variant="ghost"
                onClick={onClear}
                className={cn(GROOVY_ITEM, GROOVY_ITEM_IDLE, 'h-auto w-full text-xs')}
              >
                {t('common.filters.clearOne')}
              </Button>
            </div>
          )}
        </Command>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
