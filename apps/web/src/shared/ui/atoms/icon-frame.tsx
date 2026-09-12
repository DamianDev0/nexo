import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

const iconFrameVariants = cva(
  'flex shrink-0 items-center justify-center rounded-lg text-muted-foreground',
  {
    variants: {
      tone: {
        muted: 'bg-muted',
        outline: 'border border-dashed border-border',
      },
      size: {
        sm: 'size-7 [&_svg]:size-4',
        md: 'size-9 [&_svg]:size-4.5',
      },
    },
    defaultVariants: { tone: 'muted', size: 'md' },
  },
)

type IconFrameProps = VariantProps<typeof iconFrameVariants> & {
  readonly children: ReactNode
  readonly className?: string
}

export function IconFrame({ tone, size, children, className }: Readonly<IconFrameProps>) {
  return (
    <span
      aria-hidden
      data-slot="icon-frame"
      className={cn(iconFrameVariants({ tone, size }), className)}
    >
      {children}
    </span>
  )
}
