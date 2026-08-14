'use client'

import { cn } from '@/shared/lib/cn'
import { CaretLeftIcon, CaretRightIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

interface EdgeCollapseButtonProps {
  readonly onClick: () => void
  readonly label: string
  readonly edge: 'left' | 'right'
  readonly expanded?: boolean
  readonly className?: string
}

export function EdgeCollapseButton({
  onClick,
  label,
  edge,
  expanded = true,
  className,
}: Readonly<EdgeCollapseButtonProps>) {
  const collapseIcon = edge === 'left' ? CaretRightIcon : CaretLeftIcon
  const expandIcon = edge === 'left' ? CaretLeftIcon : CaretRightIcon
  const Icon = expanded ? collapseIcon : expandIcon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onClick}
          aria-label={label}
          aria-expanded={expanded}
          className={cn(
            'absolute top-1/2 z-20 size-6 -translate-y-1/2 rounded-full border-border bg-card p-0 text-muted-foreground shadow-xs transition-colors hover:bg-card hover:text-foreground hover:shadow-sm',
            edge === 'left' ? '-left-3' : '-right-3',
            className,
          )}
        >
          <Icon className="size-3" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={edge}>{label}</TooltipContent>
    </Tooltip>
  )
}
