'use client'

import { cn } from '@/shared/lib'
import { SearchInput } from '@/shared/ui/molecules/search-input'
import { Command, CommandEmpty, CommandList } from '@/shared/ui/shadcn/command'

import type { ReactNode } from 'react'

type SearchableCommandSearch = {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder: string
}

type SearchableCommandHighlight = {
  readonly value?: string
  readonly onChange: (value: string) => void
}

type SearchableCommandView = {
  readonly empty: ReactNode | null
  readonly listClassName?: string
}

type SearchableCommandProps = {
  readonly search?: SearchableCommandSearch
  readonly highlight: SearchableCommandHighlight
  readonly view: SearchableCommandView
  readonly footer?: ReactNode
  readonly children: ReactNode
}

export function SearchableCommand({
  search,
  highlight,
  view,
  footer,
  children,
}: Readonly<SearchableCommandProps>) {
  return (
    <Command shouldFilter={false} value={highlight.value} onValueChange={highlight.onChange}>
      {search && (
        <SearchInput
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder}
          classes={{
            container: 'border-b border-border',
            input: 'h-9 rounded-b-none border-none focus-visible:ring-0',
          }}
        />
      )}
      <CommandList className={cn('scroll-smooth scrollbar-hidden', view.listClassName)}>
        {view.empty !== null && <CommandEmpty>{view.empty}</CommandEmpty>}
        {children}
      </CommandList>
      {footer}
    </Command>
  )
}
