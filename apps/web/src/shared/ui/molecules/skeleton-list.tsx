import { cn } from '@/shared/lib'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

type SkeletonListProps = {
  readonly rows?: number
  readonly rowClassName?: string
  readonly className?: string
}

export function SkeletonList({ rows = 5, rowClassName, className }: Readonly<SkeletonListProps>) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {Array.from({ length: rows }, (_, index) => `row-${index}`).map((key) => (
        <Skeleton key={key} className={cn('h-11 w-full rounded-lg', rowClassName)} />
      ))}
    </div>
  )
}
