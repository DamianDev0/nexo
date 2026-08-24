import { Skeleton } from '@/shared/ui/shadcn/skeleton'

export default function SetupLoading() {
  return (
    <div className="flex h-svh items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-3 px-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
