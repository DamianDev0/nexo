'use client'

import { cn } from '@/shared/lib'
import {
  ArrowsInSimpleIcon,
  CaretRightIcon,
  DotsSixVerticalIcon,
  FrameCornersIcon,
  MinusIcon,
  XIcon,
} from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'

import { useComposer } from './context'

import type { ComposerControlLabels } from './lib/labels'
import type { ComponentProps, PointerEvent as ReactPointerEvent } from 'react'

type HeaderLeadingProps = {
  readonly minimized: boolean
  readonly dragLabel?: string
  readonly onStartDrag: (event: ReactPointerEvent) => void
}

function HeaderLeading({ minimized, dragLabel, onStartDrag }: Readonly<HeaderLeadingProps>) {
  if (minimized) {
    return (
      <CaretRightIcon
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/composer:translate-x-0.5"
      />
    )
  }
  if (dragLabel) {
    return (
      <HeaderIconButton
        aria-label={dragLabel}
        onPointerDown={onStartDrag}
        className="cursor-grab active:cursor-grabbing"
      >
        <DotsSixVerticalIcon />
      </HeaderIconButton>
    )
  }
  return (
    <DotsSixVerticalIcon aria-hidden className="ml-1 size-4 shrink-0 text-muted-foreground/50" />
  )
}

type ComposerHeaderProps = ComponentProps<'div'> & { readonly dragLabel?: string }

export function ComposerHeader({
  className,
  children,
  dragLabel,
  ...props
}: Readonly<ComposerHeaderProps>) {
  const { startDrag, minimized, toggleMinimized, wasDragged } = useComposer()
  return (
    <div
      data-slot="composer-header"
      role={minimized ? 'button' : undefined}
      tabIndex={minimized ? 0 : undefined}
      onPointerDown={minimized ? startDrag : undefined}
      onClick={
        minimized
          ? () => {
              if (wasDragged()) return
              toggleMinimized()
            }
          : undefined
      }
      onKeyDown={
        minimized
          ? (event) => {
              if (event.target !== event.currentTarget) return
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              toggleMinimized()
            }
          : undefined
      }
      className={cn(
        'flex shrink-0 items-center gap-1.5 border-b bg-muted/40 py-2 pr-2 pl-2 select-none',
        minimized &&
          'cursor-pointer rounded-lg border-b-0 pl-3 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing',
        className,
      )}
      {...props}
    >
      <HeaderLeading minimized={minimized} dragLabel={dragLabel} onStartDrag={startDrag} />
      {children}
    </div>
  )
}

export function ComposerTitle({ className, ...props }: Readonly<ComponentProps<'span'>>) {
  return (
    <span
      data-slot="composer-title"
      className={cn('truncate text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
}

type ComposerStandardHeaderProps = {
  readonly title: string
  readonly labels: ComposerControlLabels
}

export function ComposerStandardHeader({ title, labels }: Readonly<ComposerStandardHeaderProps>) {
  return (
    <ComposerHeader dragLabel={labels.drag}>
      <ComposerTitle>{title}</ComposerTitle>
      <ComposerControls labels={labels} />
    </ComposerHeader>
  )
}

type ComposerControlsProps = {
  readonly labels: ComposerControlLabels
  readonly className?: string
}

export function ComposerControls({ labels, className }: Readonly<ComposerControlsProps>) {
  const { minimized, maximized, toggleMinimized, toggleMaximized, onClose, startDrag } =
    useComposer()
  return (
    <div
      data-slot="composer-controls"
      className={cn('ml-auto flex shrink-0 items-center gap-0.5', className)}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {minimized && (
        <HeaderIconButton
          aria-label={labels.drag}
          onPointerDown={startDrag}
          className="cursor-grab active:cursor-grabbing"
        >
          <DotsSixVerticalIcon />
        </HeaderIconButton>
      )}
      {!minimized && (
        <HeaderIconButton aria-label={labels.minimize} onClick={toggleMinimized}>
          <MinusIcon />
        </HeaderIconButton>
      )}
      {!minimized && (
        <HeaderIconButton aria-label={labels.expand} onClick={toggleMaximized}>
          {maximized ? <ArrowsInSimpleIcon /> : <FrameCornersIcon />}
        </HeaderIconButton>
      )}
      {onClose ? (
        <HeaderIconButton aria-label={labels.close} onClick={onClose}>
          <XIcon />
        </HeaderIconButton>
      ) : null}
    </div>
  )
}
