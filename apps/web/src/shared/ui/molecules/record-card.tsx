import { cn } from '@/shared/lib'
import { Text } from '@/shared/ui/atoms/text'

import type { ReactNode } from 'react'

type RecordCardBaseProps = {
  readonly children: ReactNode
  readonly className?: string
}

type RecordCardListProps = RecordCardBaseProps & {
  readonly divided?: boolean
}

function RecordCardList({ children, divided, className }: Readonly<RecordCardListProps>) {
  return (
    <div
      role="list"
      data-slot="record-card-list"
      className={cn('flex flex-col', divided ? 'divide-y divide-border/60' : 'gap-2', className)}
    >
      {children}
    </div>
  )
}

function RecordCardRoot({ children, className }: Readonly<RecordCardBaseProps>) {
  return (
    <article
      role="listitem"
      data-slot="record-card"
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-colors hover:border-border-strong',
        className,
      )}
    >
      {children}
    </article>
  )
}

function RecordCardRow({ children, className }: Readonly<RecordCardBaseProps>) {
  return (
    <div
      role="listitem"
      data-slot="record-card-row"
      className={cn('flex items-start gap-2.5 py-1.5', className)}
    >
      {children}
    </div>
  )
}

function RecordCardHeader({ children, className }: Readonly<RecordCardBaseProps>) {
  return (
    <div
      data-slot="record-card-header"
      className={cn('flex min-w-0 items-center gap-2', className)}
    >
      {children}
    </div>
  )
}

function RecordCardAside({ children, className }: Readonly<RecordCardBaseProps>) {
  return (
    <Text variant="fine" className={cn('ml-auto shrink-0 tabular-nums', className)}>
      {children}
    </Text>
  )
}

type RecordCardMetaProps = {
  readonly children: ReactNode
  readonly icon?: ReactNode
  readonly tone?: 'neutral' | 'danger'
  readonly className?: string
}

function RecordCardMeta({
  children,
  icon,
  tone = 'neutral',
  className,
}: Readonly<RecordCardMetaProps>) {
  return (
    <Text
      variant="fine"
      className={cn(
        'flex items-center gap-1.5 font-semibold [&_svg]:size-3.5',
        tone === 'danger' ? 'text-negative-text' : 'text-body',
        className,
      )}
    >
      {icon}
      {children}
    </Text>
  )
}

type RecordCardTitleProps = {
  readonly children: ReactNode
  readonly muted?: boolean
  readonly className?: string
}

function RecordCardTitle({ children, muted, className }: Readonly<RecordCardTitleProps>) {
  return (
    <Text
      variant="strong"
      className={cn('leading-snug', muted && 'text-muted-foreground line-through', className)}
    >
      {children}
    </Text>
  )
}

type RecordCardBodyProps = {
  readonly children: ReactNode
  readonly clamped?: boolean
  readonly className?: string
}

function RecordCardBody({ children, clamped, className }: Readonly<RecordCardBodyProps>) {
  return (
    <Text
      as="p"
      variant="muted"
      className={cn('leading-relaxed whitespace-pre-line', clamped && 'line-clamp-2', className)}
    >
      {children}
    </Text>
  )
}

function RecordCardSlot({ children, className }: Readonly<RecordCardBaseProps>) {
  return (
    <span data-slot="record-card-slot" className={cn('-ml-1 flex size-5 shrink-0', className)}>
      {children}
    </span>
  )
}

export const RecordCard = Object.assign(RecordCardRoot, {
  List: RecordCardList,
  Row: RecordCardRow,
  Header: RecordCardHeader,
  Aside: RecordCardAside,
  Meta: RecordCardMeta,
  Title: RecordCardTitle,
  Body: RecordCardBody,
  Slot: RecordCardSlot,
})
