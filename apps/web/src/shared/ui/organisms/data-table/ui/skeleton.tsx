import { cn } from '@/shared/lib'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { DATA_TABLE_GUTTER } from '../config/table.constants'

interface DataTableSkeletonProps {
  readonly rows?: number
  readonly className?: string
}

export function DataTableSkeleton({ rows = 6, className }: Readonly<DataTableSkeletonProps>) {
  return (
    <div
      data-slot="table-skeleton"
      className={cn('flex flex-col gap-2.5 pb-6', DATA_TABLE_GUTTER, className)}
      aria-busy
    >
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={`table-skeleton-row-${index + 1}`} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}
