import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib'

const badgeSoftVariants = cva(
  'inline-flex h-7 items-center gap-1.75 rounded-full px-3 text-[12.5px] font-black',
  {
    variants: {
      tone: {
        neutral: 'bg-muted text-body',
        info: 'bg-info-surface text-info-text',
        warning: 'bg-warning-surface text-warning-text',
        positive: 'bg-positive-surface text-positive-text',
        negative: 'bg-negative-surface text-negative-text',
        outline: 'border border-border-strong font-medium text-body',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

const dotVariants = cva('size-1.5 rounded-full', {
  variants: {
    tone: {
      neutral: 'bg-faint',
      info: 'bg-info',
      warning: 'bg-warning-deep',
      positive: 'bg-positive',
      negative: 'bg-negative',
      outline: 'hidden',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

interface BadgeSoftProps extends VariantProps<typeof badgeSoftVariants> {
  readonly children: React.ReactNode
  readonly className?: string
}

export function BadgeSoft({ tone, children, className }: Readonly<BadgeSoftProps>) {
  return (
    <span data-slot="badge-soft" className={cn(badgeSoftVariants({ tone }), className)}>
      <span className={dotVariants({ tone })} />
      {children}
    </span>
  )
}
