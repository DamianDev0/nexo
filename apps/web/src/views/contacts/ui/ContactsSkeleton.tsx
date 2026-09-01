'use client'

import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { useSkeletonHint } from '../model/useSkeletonHint'

const HEADER_TABS = [
  ['all', 'w-24'],
  ['new', 'w-16'],
  ['contacted', 'w-28'],
  ['qualified', 'w-20'],
  ['nurturing', 'w-20'],
] as const

interface SkeletonCell {
  readonly id: string
  readonly width: number
  readonly kind: 'select' | 'lead' | 'plain'
}

function toCells(widths: ReadonlyArray<number>): ReadonlyArray<SkeletonCell> {
  return widths.map((width, index) => ({
    id: `col-${index + 1}`,
    width,
    kind: index === 0 ? 'select' : index === 1 ? 'lead' : 'plain',
  }))
}

function SkeletonCells({
  cells,
  header,
}: Readonly<{ cells: ReadonlyArray<SkeletonCell>; header?: boolean }>) {
  return (
    <>
      {cells.map((cell) => (
        <span
          key={cell.id}
          style={{ width: cell.width }}
          className="flex shrink-0 items-center gap-2.5 px-3"
        >
          {cell.kind === 'select' ? (
            <Skeleton className="size-4 rounded-[4px]" />
          ) : (
            <>
              {cell.kind === 'lead' && !header && (
                <Skeleton className="size-7 shrink-0 rounded-full" />
              )}
              <Skeleton className={header ? 'h-3 w-2/3' : 'h-3.5 w-3/5'} />
            </>
          )}
        </span>
      ))}
    </>
  )
}

export function ContactsSkeleton() {
  const hint = useSkeletonHint()
  const cells = toCells(hint.widths)

  return (
    <div className="flex flex-1 flex-col" aria-busy>
      <div className="flex h-12 shrink-0 items-center gap-5 border-b border-border px-5">
        {HEADER_TABS.map(([key, width]) => (
          <Skeleton key={key} className={`h-4 ${width}`} />
        ))}
        <span className="flex-1" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      <div className="flex h-10 shrink-0 items-center justify-between px-5">
        <Skeleton className="h-3.5 w-64" />
        <span className="flex items-center gap-3">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
        </span>
      </div>

      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border">
        <div className="flex h-12 shrink-0 items-center justify-between px-3">
          <Skeleton className="size-8 rounded-full" />
          <span className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </span>
        </div>

        <div className="flex h-9 items-center overflow-hidden border-y border-border bg-muted/30">
          <SkeletonCells cells={cells} header />
        </div>

        {Array.from({ length: hint.rows }, (_, row) => (
          <div
            key={`skeleton-row-${row + 1}`}
            className="flex h-12 items-center overflow-hidden border-b border-border/60"
          >
            <SkeletonCells cells={cells} />
          </div>
        ))}

        <span className="flex-1" />
        <div className="flex h-12 shrink-0 items-center justify-between border-t border-border px-4">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-8 w-44 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
