import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib'

const figureVariants = cva('font-[family-name:var(--font-ui)] tabular-nums', {
  variants: {
    variant: {
      display: 'text-[58px] font-black leading-none tracking-[-0.045em]',
      compact: 'text-[32px] font-black leading-none tracking-[-0.035em]',
      inline: 'text-[15px] font-medium',
    },
  },
  defaultVariants: { variant: 'inline' },
})

const symbolVariants = cva('font-medium text-muted-foreground', {
  variants: {
    variant: {
      display: 'text-[28px]',
      compact: 'text-[17px]',
      inline: 'text-[13px]',
    },
  },
  defaultVariants: { variant: 'inline' },
})

const COP_FORMAT = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const COMPACT_FORMAT = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function symbolFor(currency: string) {
  return currency === 'USD' ? 'US$' : '$'
}

interface AmountProps extends VariantProps<typeof figureVariants> {
  readonly cents: number
  readonly currency?: string
  readonly voided?: boolean
  readonly className?: string
}

export function Amount({
  cents,
  currency = 'COP',
  voided = false,
  variant,
  className,
}: Readonly<AmountProps>) {
  const pesos = Math.round(cents) / 100
  const isCompact = variant === 'compact'
  const figure = isCompact ? COMPACT_FORMAT.format(pesos / 1_000_000) : COP_FORMAT.format(pesos)

  return (
    <span
      data-slot="amount"
      className={cn(
        'inline-flex items-baseline gap-[0.18em]',
        voided && 'text-muted-foreground',
        className,
      )}
    >
      <span className={symbolVariants({ variant })}>{symbolFor(currency)}</span>
      <span className={cn(figureVariants({ variant }), voided && 'line-through')}>{figure}</span>
      {isCompact && <span className="text-[17px] font-black text-body">M</span>}
      {currency !== 'COP' && (
        <span className="text-[11px] font-bold text-muted-foreground">{currency}</span>
      )}
    </span>
  )
}
