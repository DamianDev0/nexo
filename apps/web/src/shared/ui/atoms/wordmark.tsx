import { cn } from '@/shared/lib'

interface WordmarkProps {
  readonly className?: string
}

export function Wordmark({ className }: Readonly<WordmarkProps>) {
  return (
    <span data-slot="wordmark" className={cn('inline-flex items-center gap-2.75', className)}>
      <span className="size-2.25 rounded-full bg-foreground" />
      <span className="text-sm font-bold tracking-[0.22em] text-foreground">NEXO</span>
    </span>
  )
}
