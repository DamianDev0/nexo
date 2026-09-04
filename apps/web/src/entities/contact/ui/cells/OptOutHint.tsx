import { ProhibitIcon } from '@/shared/ui/icons'
import { DataTable } from '@/shared/ui/organisms/data-table'

export function OptOutHint({ label }: Readonly<{ label?: string }>) {
  if (label === undefined) return null

  return (
    <DataTable.CellHint hint={label}>
      <ProhibitIcon className="size-3.5 text-warning-deep" />
    </DataTable.CellHint>
  )
}
