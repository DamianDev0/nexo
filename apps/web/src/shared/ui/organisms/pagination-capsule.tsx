'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/shared/lib'

const DOTS_MAX_PAGES = 9

interface PaginationData {
  readonly page: number
  readonly totalPages: number
  readonly totalLabel?: string
}

interface PaginationLabels {
  readonly root: string
  readonly prev: string
  readonly next: string
  readonly page: string
}

const DEFAULT_LABELS: PaginationLabels = {
  root: 'Pagination',
  prev: 'Previous page',
  next: 'Next page',
  page: 'Page',
}

interface PaginationCapsuleProps {
  readonly data: PaginationData
  readonly onPageChange: (page: number) => void
  readonly labels?: PaginationLabels
  readonly className?: string
}

function pageItems(page: number, totalPages: number): ReadonlyArray<number | 'gap'> {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
  if (page <= 3) return [1, 2, 3, 'gap', totalPages]
  if (page >= totalPages - 2) return [1, 'gap', totalPages - 2, totalPages - 1, totalPages]
  return [1, 'gap', page, 'gap', totalPages]
}

function Chevron({
  direction,
  label,
  disabled,
  onClick,
}: Readonly<{
  direction: 'prev' | 'next'
  label: string
  disabled: boolean
  onClick: () => void
}>) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex size-[38px] items-center justify-center rounded-full',
        disabled ? 'cursor-default text-disabled-fg' : 'cursor-pointer text-body hover:bg-muted',
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}

function Dots({
  data,
  labels,
  onPageChange,
}: Readonly<{
  data: PaginationData
  labels: PaginationLabels
  onPageChange: (page: number) => void
}>) {
  return (
    <>
      {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) =>
        page === data.page ? (
          <span key={page} aria-current="page" className="h-3 w-9 rounded-full bg-sidebar" />
        ) : (
          <button
            key={page}
            type="button"
            aria-label={`${labels.page} ${page}`}
            onClick={() => onPageChange(page)}
            className="size-2.5 cursor-pointer rounded-full bg-border"
          />
        ),
      )}
    </>
  )
}

function Numbers({
  data,
  onPageChange,
}: Readonly<{ data: PaginationData; onPageChange: (page: number) => void }>) {
  return (
    <>
      {pageItems(data.page, data.totalPages).map((item, position) =>
        item === 'gap' ? (
          <span
            key={`gap-${position === 1 ? 'left' : 'right'}`}
            className="inline-flex h-[38px] w-6 items-center justify-center text-sm text-faint"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === data.page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
            className={cn(
              'inline-flex h-[38px] min-w-[38px] cursor-pointer items-center justify-center rounded-full px-3 text-sm tabular-nums',
              item === data.page
                ? 'bg-sidebar font-black text-sidebar-foreground'
                : 'font-medium text-body hover:bg-muted',
            )}
          >
            {item}
          </button>
        ),
      )}
    </>
  )
}

export function PaginationCapsule({
  data,
  onPageChange,
  labels = DEFAULT_LABELS,
  className,
}: Readonly<PaginationCapsuleProps>) {
  const numbered = data.totalPages > DOTS_MAX_PAGES

  return (
    <nav
      data-slot="pagination-capsule"
      aria-label={labels.root}
      className={cn(
        'inline-flex h-[58px] items-center gap-1.5 rounded-full bg-card px-3.5',
        'shadow-capsule',
        className,
      )}
    >
      {numbered && data.totalLabel && (
        <span className="pl-2.5 pr-2 text-sm font-medium text-muted-foreground">
          {data.totalLabel}
        </span>
      )}
      <Chevron
        direction="prev"
        label={labels.prev}
        disabled={data.page <= 1}
        onClick={() => onPageChange(data.page - 1)}
      />
      {numbered ? (
        <Numbers data={data} onPageChange={onPageChange} />
      ) : (
        <Dots data={data} labels={labels} onPageChange={onPageChange} />
      )}
      <Chevron
        direction="next"
        label={labels.next}
        disabled={data.page >= data.totalPages}
        onClick={() => onPageChange(data.page + 1)}
      />
    </nav>
  )
}
