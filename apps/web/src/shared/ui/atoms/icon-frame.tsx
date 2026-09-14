import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

const iconFrameVariants = cva(
  'flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground [&_svg]:size-4.5',
  {
    variants: {
      tone: {
        muted: 'bg-muted',
        outline: 'border border-dashed border-border',
      },
    },
    defaultVariants: { tone: 'muted' },
  },
)

type IconFrameProps = VariantProps<typeof iconFrameVariants> & {
  readonly children: ReactNode
  readonly className?: string
}

export function IconFrame({ tone, children, className }: Readonly<IconFrameProps>) {
  return (
    <span aria-hidden data-slot="icon-frame" className={cn(iconFrameVariants({ tone }), className)}>
      {children}
    </span>
  )
}
