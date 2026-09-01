'use client'

import { cn } from '@/shared/lib/cn'
import { CaretUpDownIcon, CheckIcon, MagnifyingGlassIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { Button } from '@/shared/ui/shadcn/button'
import { Command, CommandEmpty, CommandItem, CommandList } from '@/shared/ui/shadcn/command'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { useAsyncSelect } from './use-async-select'

import type { AsyncSelectSource, AsyncSelectView } from './types'

const ASYNC_SELECT_COLLISION_PADDING = 12

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
          variant="outline"
          role="combobox"
          aria-expanded={state.open}
          disabled={disabled}
          className={cn(
            'h-9 w-full justify-between border-border bg-surface-input px-3 text-sm font-normal',
            view.display ? 'text-foreground' : 'text-muted-foreground',
            view.triggerClassName,
          )}
        >
          <span className="truncate">{view.display ?? view.placeholder}</span>
          <CaretUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </GroovyPopover.Trigger>

      <GroovyPopover.Content
        align="start"
        autoFocusContent
        subtle
        collisionPadding={ASYNC_SELECT_COLLISION_PADDING}
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command
          shouldFilter={false}
          value={state.highlightedValue}
          onValueChange={state.setHighlighted}
        >
          <div className="relative border-b border-border">
            <MagnifyingGlassIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={state.term}
              onChange={(event) => state.setTerm(event.target.value)}
              placeholder={view.searchPlaceholder}
              className="rounded-b-none border-none pl-8.5 focus-visible:ring-0"
            />
          </div>
          <CommandList className="max-h-[min(16rem,max(9rem,calc(var(--radix-popover-content-available-height)-3.25rem)))] scroll-py-1 p-1 scroll-smooth scrollbar-hidden">
            {!state.loading && state.visible.length === 0 && (
              <CommandEmpty className="px-2.5 py-4 text-center text-sm text-muted-foreground">
                {listFallback}
              </CommandEmpty>
            )}
            {state.visible.map((option) => (
              <CommandItem
                key={source.getValue(option)}
                value={source.getValue(option)}
                onSelect={() => state.select(option)}
                className="rounded-md data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
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
          </CommandList>
        </Command>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
