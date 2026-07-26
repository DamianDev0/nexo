import { cn } from '@/shared/lib'

import { Amount } from '../atoms/amount'
import { AvatarSquircle } from '../atoms/avatar-squircle'
import { BadgeSoft } from '../atoms/badge-soft'

import type { ComponentProps } from 'react'

interface KanbanCardData {
  readonly title: string
  readonly company: string
  readonly valueCents: number
  readonly ownerInitials: string
  readonly badge?: {
    readonly tone: ComponentProps<typeof BadgeSoft>['tone']
    readonly label: string
  }
}

interface KanbanCardProps {
  readonly data: KanbanCardData
  readonly inverted?: boolean
  readonly dragging?: boolean
  readonly className?: string
}

export function KanbanCard({ data, inverted, dragging, className }: Readonly<KanbanCardProps>) {
  return (
    <article
      data-slot="kanban-card"
      className={cn(
        'rounded-lg p-4',
        inverted ? 'bg-sidebar-accent' : 'bg-muted',
        dragging && 'rotate-[-0.8deg] bg-card shadow-e2',
        className,
      )}
    >
      {data.badge && <BadgeSoft tone={data.badge.tone}>{data.badge.label}</BadgeSoft>}
      <h3
        className={cn(
          'text-[15px] font-bold leading-[1.35]',
          data.badge && 'mt-2.5',
          inverted ? 'text-sidebar-foreground' : 'text-foreground',
        )}
      >
        {data.title}
      </h3>
      <p className="mt-1.5 text-[13px] text-muted-foreground">{data.company}</p>
      <footer className="mt-4 flex items-center justify-between">
        <Amount
          cents={data.valueCents}
          className={cn('font-bold', inverted && 'text-sidebar-foreground')}
        />
        <AvatarSquircle initials={data.ownerInitials} size="kanban" />
      </footer>
    </article>
  )
}

export function KanbanGhost() {
  return (
    <div
      data-slot="kanban-ghost"
      className="h-26 rounded-lg border-[1.5px] border-dashed border-border"
    />
  )
}
