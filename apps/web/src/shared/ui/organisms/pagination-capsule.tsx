'use client'

import { ChevronDown, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

const PROGRESS_SEGMENTS = 8

export interface NavLabels {
  readonly root: string
  readonly prev: string
  readonly next: string
}

const DEFAULT_LABELS: NavLabels = {
  root: 'Pagination',
  prev: 'Previous page',
  next: 'Next page',
}

function Root({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <nav
      data-slot="pagination-capsule"
      aria-label={DEFAULT_LABELS.root}
      className={cn(
        'inline-flex items-center gap-4 rounded-xl bg-card p-3 shadow-capsule',
        className,
      )}
    >
      {children}
    </nav>
  )
}

function Divider() {
  return <span className="h-6 w-px shrink-0 bg-border" />
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: Readonly<{ label: string; disabled?: boolean; onClick: () => void; children: ReactNode }>) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md transition-colors duration-[120ms]',
        disabled ? 'cursor-default text-disabled-fg' : 'cursor-pointer text-body hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}

export interface NavProps {
  readonly page: number
  readonly totalPages: number
  readonly onPageChange: (page: number) => void
  readonly labels?: NavLabels
}

function Nav({ page, totalPages, onPageChange, labels = DEFAULT_LABELS }: Readonly<NavProps>) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <IconButton label={labels.prev} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="size-4.5" />
      </IconButton>
      <span aria-current="page" className="text-[15px] font-medium tabular-nums text-body">
        {page} / {totalPages}
      </span>
      <IconButton
        label={labels.next}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4.5" />
      </IconButton>
    </span>
  )
}

export interface PageSizeProps {
  readonly value: number
  readonly options: ReadonlyArray<number>
  readonly onChange: (size: number) => void
  readonly label?: string
}

function PageSize({ value, options, onChange, label = 'Rows per page' }: Readonly<PageSizeProps>) {
  return (
    <span className="relative inline-flex w-20 items-center">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-full cursor-pointer appearance-none rounded-md bg-transparent pl-2.5 pr-6 text-[15px] font-bold tabular-nums text-primary-deep hover:bg-muted"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 size-4 text-primary-deep" />
    </span>
  )
}

function Progress({ value, label = 'Progress' }: Readonly<{ value: number; label?: string }>) {
  const clamped = Math.min(100, Math.max(0, value))
  const filled = Math.round((clamped / 100) * PROGRESS_SEGMENTS)
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      className="inline-flex h-8 w-52 items-center rounded-md bg-muted px-1.5"
    >
      <span className="inline-flex h-5 items-center gap-0.5 rounded-sm bg-card px-1">
        {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
          <span
            key={`segment-${i + 1}`}
            className={cn('h-3.5 w-1.5 rounded-[2px]', i < filled ? 'bg-primary' : 'bg-muted')}
          />
        ))}
      </span>
    </span>
  )
}

function JumpEnd({
  onClick,
  label = 'Last page',
}: Readonly<{ onClick: () => void; label?: string }>) {
  return (
    <IconButton label={label} onClick={onClick}>
      <ChevronsRight className="size-4.5" />
    </IconButton>
  )
}

export const PaginationCapsule = Object.assign(Root, {
  Nav,
  PageSize,
  Progress,
  JumpEnd,
  Divider,
})
