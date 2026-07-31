'use client'

import { cn } from '@/shared/lib'
import { MagnifyingGlassIcon, SlidersHorizontalIcon, XIcon } from '@/shared/ui/icons'

import type { ReactNode } from 'react'

export function DataTableToolbar({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div
      data-slot="table-toolbar"
      className={cn('flex items-center gap-2.5 px-4 pb-4 pt-4.5', className)}
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
        'flex h-10.5 max-w-80 flex-1 items-center gap-2 rounded-full bg-muted px-4 focus-within:ring-2 focus-within:ring-ring/50',
        className,
      )}
    >
      <MagnifyingGlassIcon className="size-4 shrink-0 text-faint" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
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
      <span className="inline-flex h-10.5 items-center gap-2 rounded-full bg-sidebar py-0 pl-4.5 pr-2 text-[15px] font-bold text-sidebar-foreground">
        <button type="button" onClick={onClick} className="cursor-pointer">
          {label}
        </button>
        {onClear && (
          <button
            type="button"
            aria-label={`Clear ${label} filter`}
            onClick={onClear}
            className="inline-flex size-6.5 cursor-pointer items-center justify-center rounded-full bg-sidebar-foreground/15"
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
      className="inline-flex h-10.5 cursor-pointer items-center gap-1.5 rounded-full border border-border-strong px-4.5 text-[15px] font-medium text-body hover:border-foreground"
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
      className="ml-auto inline-flex h-10.5 cursor-pointer items-center gap-2 rounded-full border border-border-strong px-4.5 text-[15px] font-medium text-body hover:border-foreground"
    >
      <SlidersHorizontalIcon className="size-4" />
      {label}
    </button>
  )
}
