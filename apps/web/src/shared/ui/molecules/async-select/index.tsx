'use client'

import { cn } from '@/shared/lib/cn'
import { useAsyncSelect } from '@/shared/lib/hooks/useAsyncSelect'
import { CaretDownIcon, CaretUpDownIcon, CheckIcon } from '@/shared/ui/icons'
import { EDITABLE_CELL_CARET, EDITABLE_CELL_TRIGGER } from '@/shared/ui/molecules/editable-cell'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { SearchableCommand } from '@/shared/ui/molecules/searchable-command'
import { Button } from '@/shared/ui/shadcn/button'
import { CommandItem, CommandSeparator } from '@/shared/ui/shadcn/command'

import type { AsyncSelectSource, AsyncSelectView } from './types'

const ASYNC_SELECT_COLLISION_PADDING = 12
const CLEAR_VALUE = '__clear__'
const ITEM = 'rounded-md data-[selected=true]:bg-muted data-[selected=true]:text-foreground'

export type { AsyncSelectSource, AsyncSelectView } from './types'

interface AsyncSelectProps<T> {
  readonly value: string
  readonly onChange: (value: string, option: T | null) => void
  readonly source: AsyncSelectSource<T>
  readonly view: AsyncSelectView
  readonly disabled?: boolean
}

export function AsyncSelect<T>({
  value,
  onChange,
  source,
  view,
  disabled,
}: Readonly<AsyncSelectProps<T>>) {
  const state = useAsyncSelect(source, (option) => onChange(source.getValue(option), option))

  const emptyContent = typeof view.empty === 'function' ? view.empty(state.term) : view.empty
  const listFallback = state.failed ? (view.error ?? emptyContent) : emptyContent

  return (
    <GroovyPopover open={state.open} onOpenChange={state.onOpenChange} modal>
      <GroovyPopover.Trigger asChild>
        <Button
          type="button"
          variant={view.compact ? 'ghost' : 'outline'}
          role="combobox"
          aria-label={view.label}
          aria-expanded={state.open}
          disabled={disabled}
          className={cn(
            view.compact
              ? EDITABLE_CELL_TRIGGER
              : 'h-9 w-full justify-between border-border bg-surface-input px-3 text-sm font-normal',
            view.display ? 'text-foreground' : 'text-muted-foreground',
            view.triggerClassName,
          )}
        >
          <span className="truncate">{view.display ?? view.placeholder}</span>
          {view.compact ? (
            <CaretDownIcon className={EDITABLE_CELL_CARET} />
          ) : (
            <CaretUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
          )}
        </Button>
      </GroovyPopover.Trigger>

      <GroovyPopover.Content
        align="start"
        autoFocusContent
        subtle
        collisionPadding={ASYNC_SELECT_COLLISION_PADDING}
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <SearchableCommand
          search={
            view.searchable === false
              ? undefined
              : { value: state.term, onChange: state.setTerm, placeholder: view.searchPlaceholder }
          }
          highlight={{ value: state.highlightedValue, onChange: state.setHighlighted }}
          view={{
            label: view.label,
            empty: !state.loading && state.visible.length === 0 ? listFallback : null,
            listClassName:
              'max-h-[min(16rem,max(9rem,calc(var(--radix-popover-content-available-height)-3.25rem)))] scroll-py-1 p-1',
          }}
        >
          {state.visible.map((option) => (
            <CommandItem
              key={source.getValue(option)}
              value={source.getValue(option)}
              onSelect={() => state.select(option)}
              className={ITEM}
            >
              {source.renderOption(option)}
              <CheckIcon
                strokeWidth={3}
                className={cn(
                  'ml-auto size-3.5 shrink-0 text-primary-deep dark:text-primary',
                  value === source.getValue(option) ? 'opacity-100' : 'opacity-0',
                )}
              />
            </CommandItem>
          ))}
          {view.clear && value !== '' ? (
            <>
              <CommandSeparator />
              <CommandItem
                value={CLEAR_VALUE}
                onSelect={() => {
                  onChange('', null)
                  state.onOpenChange(false)
                }}
                className={cn(ITEM, 'text-muted-foreground')}
              >
                {view.clear}
              </CommandItem>
            </>
          ) : null}
        </SearchableCommand>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
