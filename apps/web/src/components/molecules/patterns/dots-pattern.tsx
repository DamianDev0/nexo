import { cn } from '@/utils'

interface DotsPatternProps {
  readonly width?: number
  readonly height?: number
  readonly className?: string
}

export function DotsPattern({ width = 8, height = 8, className }: DotsPatternProps) {
  const id = `dots-${width}-${height}`

  return (
    <svg className={cn('size-full', className)} aria-hidden>
      <defs>
        <pattern id={id} x="0" y="0" width={width} height={height} patternUnits="userSpaceOnUse">
          <circle cx={width / 2} cy={height / 2} r="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
