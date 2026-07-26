import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib'

const badgeInkVariants = cva(
  'inline-flex items-center rounded-full bg-sidebar font-black text-sidebar-foreground',
  {
    variants: {
      size: {
        sm: 'h-8 gap-2 px-3.5 text-[12.5px]',
        md: 'h-9.5 gap-2.5 px-4.5 text-sm',
        lg: 'h-11.5 gap-2.5 px-5.5 text-[15px]',
      },
    },
    defaultVariants: { size: 'lg' },
  },
)

const TONE_VARS = {
  neutral: 'var(--faint)',
  info: 'var(--info)',
  positive: 'var(--primary)',
  negative: 'var(--destructive)',
  warning: 'var(--warning)',
} as const

interface BadgeInkProps extends VariantProps<typeof badgeInkVariants> {
  readonly tone?: keyof typeof TONE_VARS
  readonly indicator?: 'dot' | 'spinner' | 'check' | 'cross'
  readonly children: React.ReactNode
  readonly className?: string
}

function Indicator({ kind, toneVar }: Readonly<{ kind: string; toneVar: string }>) {
  if (kind === 'spinner') {
    return (
      <span
        className="size-3.75 rounded-full border-2 border-white/20"
        style={{ borderTopColor: toneVar, animation: 'badge-spin 900ms linear infinite' }}
      />
    )
  }
  if (kind === 'check') return <span style={{ color: toneVar }}>✓</span>
  if (kind === 'cross') return <span style={{ color: toneVar }}>✕</span>
  return <span className="size-2.25 rounded-full" style={{ background: toneVar }} />
}

export function BadgeInk({
  tone = 'neutral',
  indicator = 'dot',
  size,
  children,
  className,
}: Readonly<BadgeInkProps>) {
  const toneVar = TONE_VARS[tone]
  const halo =
    tone === 'neutral'
      ? '0 10px 26px -12px rgba(14,15,12,0.55)'
      : `0 0 0 1px color-mix(in srgb, ${toneVar} 35%, transparent), 0 12px 30px -8px color-mix(in srgb, ${toneVar} 55%, transparent)`

  return (
    <span
      data-slot="badge-ink"
      className={cn(badgeInkVariants({ size }), className)}
      style={{ boxShadow: halo }}
    >
      <Indicator kind={indicator} toneVar={toneVar} />
      {children}
    </span>
  )
}
