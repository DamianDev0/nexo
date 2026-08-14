'use client'

import { cn } from '@/shared/lib'
import { MagnifyingGlassIcon, SlidersHorizontalIcon, XIcon } from '@/shared/ui/icons'

import { DATA_TABLE_GUTTER } from '../config/table.constants'

import type { ReactNode } from 'react'

export function DataTableToolbar({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div
      data-slot="table-toolbar"
      className={cn('flex items-center gap-2 py-3', DATA_TABLE_GUTTER, className)}
    >
      {children}
    </div>
  )
}

interface SearchInputProps {
  readonly value: string
  readonly placeholder: string
  readonly onChange: (value: string) => void
  readonly className?: string
}

export function DataTableSearch({
  value,
  placeholder,
  onChange,
  className,
}: Readonly<SearchInputProps>) {
  return (
    <label
      className={cn(
        'flex h-9 max-w-72 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25',
        className,
      )}
    >
      <MagnifyingGlassIcon className="size-3.5 shrink-0 text-muted-foreground" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  )
}

interface FilterPillProps {
  readonly label: string
  readonly active?: boolean
  readonly onClick: () => void
  readonly onClear?: () => void
}

export function DataTableFilter({ label, active, onClick, onClear }: Readonly<FilterPillProps>) {
  if (active) {
    return (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sidebar py-0 pl-3 pr-1.5 text-sm font-semibold text-sidebar-foreground">
        <button type="button" onClick={onClick} className="cursor-pointer">
          {label}
        </button>
        {onClear && (
          <button
            type="button"
            aria-label={`Clear ${label} filter`}
            onClick={onClear}
            className="inline-flex size-5.5 cursor-pointer items-center justify-center rounded-md bg-sidebar-foreground/15"
          >
            <XIcon className="size-3" />
          </button>
        )}
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-body transition-colors hover:border-border-strong hover:bg-muted"
    >
      {label}
    </button>
  )
}

export function DataTableEditColumns({
  label,
  onClick,
}: Readonly<{ label: string; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-auto inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-body transition-colors hover:border-border-strong hover:bg-muted"
    >
      <SlidersHorizontalIcon className="size-3.5" />
      {label}
    </button>
  )
}
