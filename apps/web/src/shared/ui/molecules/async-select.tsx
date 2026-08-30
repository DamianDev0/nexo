'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { CaretUpDownIcon, CheckIcon, MagnifyingGlassIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { Button } from '@/shared/ui/shadcn/button'
import { Command, CommandEmpty, CommandItem, CommandList } from '@/shared/ui/shadcn/command'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import type { ReactNode } from 'react'

const ASYNC_SELECT_COLLISION_PADDING = 12
const ASYNC_SELECT_STALE_MS = 60 * 1000
const ASYNC_SELECT_DEBOUNCE_MS = 300

interface AsyncSelectSourceBase<T> {
  readonly getValue: (option: T) => string
  readonly renderOption: (option: T) => ReactNode
  readonly filterFn?: (option: T, query: string) => boolean
}

export type AsyncSelectSource<T> = AsyncSelectSourceBase<T> &
  (
    | { readonly options: ReadonlyArray<T>; readonly key?: never; readonly fetcher?: never }
    | {
        readonly options?: never
        readonly key: string
        readonly fetcher: (query: string) => Promise<ReadonlyArray<T>>
      }
  )

export interface AsyncSelectView {
  readonly display?: ReactNode
  readonly placeholder: string
  readonly searchPlaceholder: string
  readonly empty: ReactNode | ((term: string) => ReactNode)
  readonly error?: ReactNode
  readonly triggerClassName?: string
}

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
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const debounced = useDebouncedValue(term, source.options ? 0 : ASYNC_SELECT_DEBOUNCE_MS)

  const query = useQuery({
    queryKey: ['async-select', source.key ?? 'static', debounced],
    queryFn: async () => (source.fetcher ? source.fetcher(debounced) : []),
    enabled: open && Boolean(source.fetcher),
    staleTime: ASYNC_SELECT_STALE_MS,
    placeholderData: keepPreviousData,
  })

  const items = source.options ?? query.data
  const loading = Boolean(source.fetcher) && open && query.isFetching

  const visible = useMemo(() => {
    const base = items ?? []
    if (!source.options || !term) return base
    return base.filter((option) => source.filterFn?.(option, term) ?? true)
  }, [items, term, source])

  const failed = Boolean(source.fetcher) && query.isError
  const emptyContent = typeof view.empty === 'function' ? view.empty(term) : view.empty
  const listFallback = failed ? (view.error ?? emptyContent) : emptyContent

  const select = (option: T) => {
    onChange(source.getValue(option), option)
    setTerm('')
    setOpen(false)
  }

  return (
    <GroovyPopover open={open} onOpenChange={setOpen} modal>
      <GroovyPopover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
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
        <Command shouldFilter={false}>
          <div className="relative border-b border-border">
            <MagnifyingGlassIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={view.searchPlaceholder}
              className="rounded-b-none border-none pl-8.5 focus-visible:ring-0"
            />
          </div>
          <CommandList className="max-h-[min(16rem,max(9rem,calc(var(--radix-popover-content-available-height)-3.25rem)))] scroll-py-1 p-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {!loading && visible.length === 0 && (
              <CommandEmpty className="px-2.5 py-4 text-center text-sm text-muted-foreground">
                {listFallback}
              </CommandEmpty>
            )}
            {visible.map((option) => (
              <CommandItem
                key={source.getValue(option)}
                value={source.getValue(option)}
                onSelect={() => select(option)}
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
