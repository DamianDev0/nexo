'use client'

import { ContextActionMenu } from '@/shared/ui/molecules/context-action-menu'

import { useDataTableContext } from '../../model/context'
import { useRowContextMenu } from '../../model/use-row-context-menu'

import { DataTableRow } from './row'

interface DataTableBodyProps {
  readonly busy?: boolean
  readonly className?: string
}

export function DataTableBody({ busy, className }: Readonly<DataTableBodyProps>) {
  const { table, rowHeight, rowContextMenu } = useDataTableContext()
  const contextMenu = useRowContextMenu(table, rowContextMenu)

  return (
    <ContextActionMenu items={contextMenu.items} onContextMenu={contextMenu.onContextMenu}>
      <tbody data-slot="table-body" aria-busy={busy || undefined} className={className}>
        {table.getRowModel().rows.map((row) => (
          <DataTableRow key={row.id} row={row} height={rowHeight} />
        ))}
      </tbody>
    </ContextActionMenu>
  )
}
