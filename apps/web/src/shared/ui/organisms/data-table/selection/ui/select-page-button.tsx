'use client'

import { CheckSquareIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { PaginationCapsule } from '@/shared/ui/organisms/pagination-capsule'

import { useDataTableContext } from '../../model/context'

export interface SelectPageLabels {
  readonly select: string
  readonly clear: string
}

export function DataTableSelectPage({ labels }: Readonly<{ labels: SelectPageLabels }>) {
  const { table } = useDataTableContext()
  const allSelected = table.getIsAllPageRowsSelected()
  const label = allSelected ? labels.clear : labels.select

  return (
    <HintTooltip asChild hint={label}>
      <span className="inline-flex">
        <PaginationCapsule.Action
          label={label}
          state={{ pressed: allSelected }}
          onClick={() => table.toggleAllPageRowsSelected(!allSelected)}
        >
          <CheckSquareIcon className="size-4" />
        </PaginationCapsule.Action>
      </span>
    </HintTooltip>
  )
}
