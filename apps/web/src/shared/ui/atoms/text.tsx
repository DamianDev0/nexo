import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-sm text-body',
      muted: 'text-sm text-muted-foreground',
      hint: 'text-xs text-muted-foreground',
      strong: 'text-sm font-medium text-foreground',
      emphasis: 'text-xs font-semibold text-foreground',
      overline: 'text-xs font-bold uppercase tracking-widest text-foreground',
      kicker: 'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      caption: 'text-[11px] font-semibold tracking-wide text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'body' },
})

type TextTag = 'span' | 'p' | 'dt' | 'dd' | 'legend' | 'figcaption'

type TextProps = VariantProps<typeof textVariants> & {
  readonly as?: TextTag
  readonly className?: string
  readonly children: ReactNode
  readonly id?: string
  readonly title?: string
}

export function Text({ as: Tag = 'span', variant, className, ...props }: Readonly<TextProps>) {
  return <Tag className={cn(textVariants({ variant }), className)} {...props} />
}
