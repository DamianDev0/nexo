import { cn } from '@/shared/lib/cn'

interface ColorDotProps {
  readonly color: string
  readonly className?: string
}

export function ColorDot({ color, className }: Readonly<ColorDotProps>) {
  return (
    <span
      aria-hidden
      className={cn('size-2 shrink-0 rounded-full', className)}
      style={{ background: color }}
    />
  )
}
