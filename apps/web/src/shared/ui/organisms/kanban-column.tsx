import { cn } from '@/shared/lib'

import { Amount } from '../atoms/amount'

import type { ReactNode } from 'react'

interface KanbanColumnHeader {
  readonly stage: string
  readonly count: number
  readonly totalCents: number
}

interface KanbanColumnProps {
  readonly header: KanbanColumnHeader
  readonly inverted?: boolean
  readonly children: ReactNode
  readonly className?: string
}

export function KanbanColumn({
  header,
  inverted,
  children,
  className,
}: Readonly<KanbanColumnProps>) {
  return (
    <section
      data-slot="kanban-column"
      className={cn('rounded-xl p-4', inverted ? 'bg-sidebar' : 'bg-card', className)}
    >
      <header className="flex items-center justify-between px-2 pb-3.5 pt-1.5">
        <h2
          className={cn(
            'text-sm font-black',
            inverted ? 'text-sidebar-foreground' : 'text-foreground',
          )}
        >
          {header.stage} <span className="font-medium text-muted-foreground">· {header.count}</span>
        </h2>
        <Amount
          cents={header.totalCents}
          variant="compact"
          className={cn(
            '[&>span]:!text-[13px] [&>span]:!font-bold',
            inverted ? 'text-primary [&>span]:!text-primary' : 'text-body',
          )}
        />
      </header>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  )
}
