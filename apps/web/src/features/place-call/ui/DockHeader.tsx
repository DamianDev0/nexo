'use client'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Wordmark } from '@/shared/ui/atoms/wordmark'
import { ArrowsOutIcon, CaretDownIcon, MinusIcon, XIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import type { HTMLAttributes } from 'react'

type DockHeaderProps = {
  readonly presence: {
    readonly label: string
    readonly tone: string
    readonly onClick: () => void
  }
  readonly actions: {
    readonly minimizeLabel: string
    readonly onMinimize: () => void
    readonly expandLabel: string
    readonly expandHint: string
    readonly closeLabel: string
    readonly onClose?: () => void
  }
  readonly dragProps?: HTMLAttributes<HTMLDivElement>
}

export function DockHeader({ presence, actions, dragProps }: Readonly<DockHeaderProps>) {
  return (
    <div
      {...dragProps}
      className={cn(
        'grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-card px-2',
        dragProps && 'cursor-grab select-none active:cursor-grabbing',
      )}
    >
      <PillButton
        variant="ghost"
        size="xs"
        onClick={presence.onClick}
        className="h-7 justify-self-start gap-1.5 px-2 text-xs font-medium text-foreground"
      >
        <span aria-hidden className={cn('size-2 rounded-full', presence.tone)} />
        {presence.label}
        <CaretDownIcon className="size-3 opacity-70" />
      </PillButton>
      <Wordmark dot={false} className="[&>span]:text-xs" />
      <span className="flex items-center justify-self-end">
        <HintTooltip asChild hint={actions.expandHint}>
          <span>
            <PillButton
              variant="ghost"
              size="xs"
              aria-label={actions.expandLabel}
              disabled
              className="w-8 px-0 text-muted-foreground"
            >
              <ArrowsOutIcon className="size-3.5" />
            </PillButton>
          </span>
        </HintTooltip>
        <PillButton
          variant="ghost"
          size="xs"
          aria-label={actions.minimizeLabel}
          onClick={actions.onMinimize}
          className="w-8 px-0 text-muted-foreground hover:text-foreground"
        >
          <MinusIcon className="size-4" />
        </PillButton>
        {actions.onClose ? (
          <PillButton
            variant="ghost"
            size="xs"
            aria-label={actions.closeLabel}
            onClick={actions.onClose}
            className="w-8 px-0 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
          </PillButton>
        ) : null}
      </span>
    </div>
  )
}
