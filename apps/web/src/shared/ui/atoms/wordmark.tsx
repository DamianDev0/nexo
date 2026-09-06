import { cn } from '@/shared/lib'

interface WordmarkProps {
  readonly className?: string
  readonly dot?: boolean
}

export function Wordmark({ className, dot = true }: Readonly<WordmarkProps>) {
  return (
    <span data-slot="wordmark" className={cn('inline-flex items-center gap-2.75', className)}>
      {dot ? <span className="size-2.25 rounded-full bg-foreground" /> : null}
      <span className="text-sm font-bold tracking-[0.22em] text-foreground">NEXO</span>
    </span>
  )
}
