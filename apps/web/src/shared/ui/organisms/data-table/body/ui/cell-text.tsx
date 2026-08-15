import { cn } from '@/shared/lib/cn'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'

import type { ReactNode } from 'react'

export function DataTableCellText({
  children,
  muted,
  numeric,
}: Readonly<{ children: ReactNode; muted?: boolean; numeric?: boolean }>) {
  if (children === null || children === undefined || children === '') {
    return <span className="text-faint">—</span>
  }

  return (
    <TruncateTip
      className={cn(
        muted && 'text-muted-foreground',
        numeric && 'tabular-nums text-muted-foreground',
      )}
    >
      {children}
    </TruncateTip>
  )
}
