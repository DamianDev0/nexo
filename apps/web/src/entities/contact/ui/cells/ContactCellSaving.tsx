import { cn } from '@/shared/lib/cn'
import { CircleNotchIcon } from '@/shared/ui/icons'

import type { ReactNode } from 'react'

type ContactCellSavingProps = {
  readonly saving: boolean
  readonly label: string
  readonly children: ReactNode
}

export function ContactCellSaving({ saving, label, children }: Readonly<ContactCellSavingProps>) {
  return (
    <span
      aria-busy={saving || undefined}
      className={cn('flex min-w-0 flex-1 items-center gap-1', saving && 'opacity-60')}
    >
      {children}
      {saving ? (
        <CircleNotchIcon aria-label={label} className="size-3.5 shrink-0 animate-spin text-faint" />
      ) : null}
    </span>
  )
}
