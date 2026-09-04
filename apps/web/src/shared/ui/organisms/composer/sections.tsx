'use client'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { HIDDEN_WHEN_MINIMIZED } from './constants'

import type { ComponentProps, ReactNode } from 'react'

type ComposerFieldProps = {
  readonly label: ReactNode
  readonly children: ReactNode
  readonly end?: ReactNode
  readonly error?: string
  readonly className?: string
}

export function ComposerField({
  label,
  children,
  end,
  error,
  className,
}: Readonly<ComposerFieldProps>) {
  return (
    <div
      data-slot="composer-field"
      className={cn(
        'flex shrink-0 flex-col justify-center border-b px-4 py-1.5',
        HIDDEN_WHEN_MINIMIZED,
        className,
      )}
    >
      <div className="flex min-h-8 items-center gap-2">
        <span
          data-slot="composer-field-label"
          className="flex min-w-12 shrink-0 items-center text-sm text-muted-foreground"
        >
          {label}
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
        {end ? <div className="flex shrink-0 items-center gap-1">{end}</div> : null}
      </div>
      {error ? (
        <div className="pl-14">
          <FieldError message={error} />
        </div>
      ) : null}
    </div>
  )
}

export function ComposerBody({ className, ...props }: Readonly<ComponentProps<'div'>>) {
  return (
    <div
      data-slot="composer-body"
      className={cn(
        'max-h-100 min-h-0 flex-1 overflow-y-auto px-4 py-3',
        'group-data-maximized/composer:max-h-none',
        HIDDEN_WHEN_MINIMIZED,
        className,
      )}
      {...props}
    />
  )
}

export function ComposerFooter({ className, ...props }: Readonly<ComponentProps<'div'>>) {
  return (
    <div
      data-slot="composer-footer"
      className={cn(
        'flex shrink-0 items-center gap-2 border-t px-3 py-2',
        HIDDEN_WHEN_MINIMIZED,
        className,
      )}
      {...props}
    />
  )
}

export function ComposerFooterEnd({ className, ...props }: Readonly<ComponentProps<'div'>>) {
  return (
    <div
      data-slot="composer-footer-end"
      className={cn('ml-auto flex shrink-0 items-center gap-2', className)}
      {...props}
    />
  )
}

type ComposerAction = {
  readonly label: string
  readonly onClick?: () => void
  readonly disabled?: boolean
  readonly hint?: string
}

type ComposerActionsProps = {
  readonly cancel: ComposerAction
  readonly action: ComposerAction
}

export function ComposerActions({ cancel, action }: Readonly<ComposerActionsProps>) {
  const confirm = (
    <PillButton size="xs" onClick={action.onClick} disabled={action.disabled}>
      {action.label}
    </PillButton>
  )
  return (
    <ComposerFooterEnd>
      <PillButton variant="outline" size="xs" onClick={cancel.onClick}>
        {cancel.label}
      </PillButton>
      {action.hint ? (
        <HintTooltip asChild hint={action.hint}>
          <span>{confirm}</span>
        </HintTooltip>
      ) : (
        confirm
      )}
    </ComposerFooterEnd>
  )
}
