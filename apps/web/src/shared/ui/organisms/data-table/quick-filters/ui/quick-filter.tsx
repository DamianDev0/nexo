'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { CaretDownIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { GROOVY_ITEM, GROOVY_ITEM_IDLE } from '@/shared/ui/molecules/groovy-popover/constants'
import { SearchableCommand } from '@/shared/ui/molecules/searchable-command'
import { Button } from '@/shared/ui/shadcn/button'

import { useQuickFilter } from '../model/use-quick-filter'

import { OptionRow } from './option-row'

import type { QuickFilterDef } from '../model/types'

interface QuickFilterProps {
  readonly filter: QuickFilterDef
  readonly onToggle: (value: string) => void
  readonly onClear: () => void
}

export function QuickFilter({ filter, onToggle, onClear }: Readonly<QuickFilterProps>) {
  const { t } = useTranslation()
  const state = useQuickFilter(filter)

  return (
    <GroovyPopover open={state.open} onOpenChange={state.onOpenChange}>
      <GroovyPopover.Anchor asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={state.open}
          onClick={() => state.onOpenChange(!state.open)}
          className={cn(
            'h-8 gap-1.5 px-1.5 text-sm font-normal transition-colors duration-200 hover:bg-transparent',
            state.active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <span className="font-medium">{filter.label}</span>
          {state.summary && (
            <span className="max-w-28 truncate font-semibold tabular-nums text-primary-deep dark:text-primary">
              {state.summary}
            </span>
          )}
          <CaretDownIcon
            className={cn(
              'size-3 shrink-0 transition-transform duration-200',
              state.open && 'rotate-180',
            )}
          />
        </Button>
      </GroovyPopover.Anchor>

      <GroovyPopover.Content align="end" autoFocusContent className="w-64 p-0">
        <SearchableCommand
          search={
            state.searchable
              ? {
                  value: state.term,
                  onChange: state.setTerm,
                  placeholder: t('common.filters.searchOption'),
                }
              : undefined
          }
          highlight={{ value: state.highlightedValue, onChange: state.setHighlighted }}
          view={{
            empty: t('common.noResults'),
            listClassName: 'max-h-49 scroll-py-1.5 p-1.5 **:[[cmdk-list-sizer]]:space-y-1',
          }}
          footer={
            state.active && (
              <div className="border-t border-border p-1">
                <Button
                  variant="ghost"
                  onClick={onClear}
                  className={cn(GROOVY_ITEM, GROOVY_ITEM_IDLE, 'h-auto w-full text-xs')}
                >
                  {t('common.filters.clearOne')}
                </Button>
              </div>
            )
          }
        >
          {state.visible.map((option) => (
            <OptionRow
              key={option.value}
              option={option}
              checked={filter.selected.includes(option.value)}
              onToggle={() => onToggle(option.value)}
            />
          ))}
        </SearchableCommand>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
