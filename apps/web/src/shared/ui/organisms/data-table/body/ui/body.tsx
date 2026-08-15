'use client'

import { motion } from 'motion/react'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'

import { useDataTableContext } from '../../model/context'

import { DataTableRow } from './row'

interface DataTableBodyProps {
  readonly pageKey?: string | number
  readonly dimmed?: boolean
  readonly className?: string
}

export function DataTableBody({ pageKey, dimmed, className }: Readonly<DataTableBodyProps>) {
  const { table, rowHeight } = useDataTableContext()
  const transition = useReducedTransition(quickEase)

  return (
    <motion.tbody
      key={pageKey}
      data-slot="table-body"
      initial={{ opacity: 0 }}
      animate={{ opacity: dimmed ? 0.55 : 1 }}
      transition={transition}
      className={className}
    >
      {table.getRowModel().rows.map((row) => (
        <DataTableRow key={row.id} row={row} height={rowHeight} />
      ))}
    </motion.tbody>
  )
}
