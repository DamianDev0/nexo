import { cn } from '@/shared/lib'

function Skeleton({ className, ...props }: Readonly<React.ComponentProps<'div'>>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  )
}

export { Skeleton }
