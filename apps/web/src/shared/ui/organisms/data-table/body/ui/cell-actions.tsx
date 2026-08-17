'use client'

import { cn } from '@/shared/lib/cn'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Button } from '@/shared/ui/shadcn/button'

import type { ComponentProps, ReactNode } from 'react'

export function DataTableCellActions({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return <span className={cn('flex shrink-0 items-center gap-0.5', className)}>{children}</span>
}

type CellActionProps = Readonly<{
  label: string
  children: ReactNode
  onClick?: () => void
  href?: string
  external?: boolean
}>

function actionButton({ label, children, onClick, href, external }: CellActionProps) {
  const shared: ComponentProps<typeof Button> = {
    variant: 'ghost',
    size: 'icon-xs',
    'aria-label': label,
    className: 'text-muted-foreground hover:text-foreground',
  }

  if (href !== undefined) {
    return (
      <Button {...shared} asChild>
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer noopener' : undefined}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </a>
      </Button>
    )
  }

  return (
    <Button
      {...shared}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
    >
      {children}
    </Button>
  )
}

export function DataTableCellAction(props: CellActionProps) {
  return (
    <HintTooltip asChild hint={props.label}>
      {actionButton(props)}
    </HintTooltip>
  )
}
