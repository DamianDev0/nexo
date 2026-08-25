import { Skeleton } from '@/shared/ui/shadcn/skeleton'

const HEADER_TABS = [
  ['all', 'w-24'],
  ['new', 'w-16'],
  ['contacted', 'w-28'],
  ['qualified', 'w-20'],
  ['nurturing', 'w-20'],
] as const
const ROW_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

function SkeletonRow() {
  return (
    <div className="flex h-12 items-center gap-4 border-b border-border/60 px-4">
      <Skeleton className="size-4 rounded-[4px]" />
      <span className="flex w-1/4 min-w-32 items-center gap-2.5">
        <Skeleton className="size-7 rounded-full" />
        <Skeleton className="h-3.5 w-3/5" />
      </span>
      <span className="flex w-1/6 items-center gap-1.5">
        <Skeleton className="size-2.5 rounded-full" />
        <Skeleton className="h-3.5 w-16" />
      </span>
      <Skeleton className="h-3.5 w-1/5" />
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-3.5 w-14" />
    </div>
  )
}

export function ContactsSkeleton() {
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

        <div className="flex h-9 items-center gap-4 border-y border-border bg-muted/30 px-4">
          <Skeleton className="size-4 rounded-[4px]" />
          <Skeleton className="h-3 w-1/4 min-w-32" />
          <Skeleton className="h-3 w-1/6" />
          <Skeleton className="h-3 w-1/5" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>

        {ROW_KEYS.map((key) => (
          <SkeletonRow key={key} />
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
