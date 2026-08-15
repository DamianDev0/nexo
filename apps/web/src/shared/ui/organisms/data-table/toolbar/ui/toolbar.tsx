'use client'

import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/shared/lib/cn'

import { DATA_TABLE_GUTTER, DATA_TABLE_TOOLBAR_SWAP } from '../../config/table.constants'
import { useDataTableContext } from '../../model/context'

import { DataTableBulkBar } from './bulk-bar'

import type { DataTableBulkConfig } from '../model/types'
import type { ReactNode } from 'react'

interface ToolbarProps {
  readonly children: ReactNode
  readonly bulk?: DataTableBulkConfig
  readonly className?: string
}

export function DataTableToolbar({ children, bulk, className }: Readonly<ToolbarProps>) {
  const { selection } = useDataTableContext()
  const showBulk = bulk !== undefined && selection.active

  return (
    <div data-slot="table-toolbar" className={cn('grid py-1.5', DATA_TABLE_GUTTER, className)}>
      <AnimatePresence initial={false}>
        <motion.div
          key={showBulk ? 'bulk' : 'default'}
          {...DATA_TABLE_TOOLBAR_SWAP}
          className="col-start-1 row-start-1 flex min-h-9 min-w-0 flex-wrap items-center gap-2"
        >
          {showBulk && bulk ? <DataTableBulkBar {...bulk} /> : children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
