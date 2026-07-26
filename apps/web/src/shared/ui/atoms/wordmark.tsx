import { cn } from '@/shared/lib'

interface WordmarkProps {
  readonly className?: string
}

export function Wordmark({ className }: Readonly<WordmarkProps>) {
  return (
    <span data-slot="wordmark" className={cn('inline-flex items-center gap-[11px]', className)}>
      <span className="size-[9px] rounded-full bg-foreground" />
      <span className="text-sm font-bold tracking-[0.22em] text-foreground">NEXO</span>
    </span>
  )
}
