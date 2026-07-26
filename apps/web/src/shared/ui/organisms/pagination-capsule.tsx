'use client'

import { ChevronDown, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

import { cn } from '@/shared/lib'

import type { PaginationMeta } from '@repo/shared-types'
import type { ReactNode } from 'react'

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
        'inline-flex h-12 items-center gap-1 rounded-full bg-card py-1.5 pl-2 pr-1.5 shadow-capsule',
        className,
      )}
    >
      {children}
    </nav>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" />
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
        'inline-flex size-9 items-center justify-center rounded-full transition-colors duration-[120ms]',
        disabled ? 'cursor-default text-disabled-fg' : 'cursor-pointer text-body hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}

export type NavProps = Pick<PaginationMeta, 'page' | 'totalPages'> & {
  readonly onPageChange: (page: number) => void
  readonly labels?: NavLabels
}

function Nav({ page, totalPages, onPageChange, labels = DEFAULT_LABELS }: Readonly<NavProps>) {
  return (
    <span className="inline-flex items-center">
      <IconButton label={labels.prev} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="size-4" />
      </IconButton>
      <span aria-current="page" className="px-1 text-sm font-bold tabular-nums text-foreground">
        {page}
        <span className="font-medium text-muted-foreground">/{totalPages}</span>
      </span>
      <IconButton
        label={labels.next}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4" />
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
    <span className="relative inline-flex items-center">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 cursor-pointer appearance-none rounded-full bg-transparent pl-3 pr-7 text-sm font-bold tabular-nums text-foreground hover:bg-muted"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" />
    </span>
  )
}

function Progress({ value, label = 'Progress' }: Readonly<{ value: number; label?: string }>) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      className="inline-flex h-4 w-24 overflow-hidden rounded-full bg-muted"
    >
      <span className="h-full rounded-full bg-primary" style={{ width: `${clamped}%` }} />
    </span>
  )
}

function JumpEnd({
  onClick,
  label = 'Last page',
}: Readonly<{ onClick: () => void; label?: string }>) {
  return (
    <IconButton label={label} onClick={onClick}>
      <ChevronsRight className="size-4" />
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
