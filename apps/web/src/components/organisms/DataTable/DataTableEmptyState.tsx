import { Inbox } from 'lucide-react'
import type { DataTableEmptyStateProps } from './types'

interface Props {
  readonly emptyState?: DataTableEmptyStateProps
}

export function DataTableEmptyState({ emptyState }: Props) {
  const icon = emptyState?.icon ?? <Inbox className="size-10 text-muted-foreground/50" />
  const title = emptyState?.title ?? 'No results found'

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      {icon}
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {emptyState?.description && (
          <p className="mt-1 text-sm text-muted-foreground">{emptyState.description}</p>
        )}
      </div>
      {emptyState?.action}
    </div>
  )
}
