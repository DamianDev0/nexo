'use client'

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { useId } from 'react'

import { cn } from '@/shared/lib/cn'
import { Table } from '@/shared/ui/shadcn/table'

import { columnWidth } from '../../lib/column-size'
import { useDataTableContext } from '../../model/context'

import type { ReactNode } from 'react'

export function DataTableGrid({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  const { table, reorderColumn } = useDataTableContext()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const dndId = useId()

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) reorderColumn(String(active.id), String(over.id))
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
    >
      <Table
        style={{ minWidth: table.getTotalSize() }}
        className={cn('table-fixed border-separate border-spacing-0', className)}
      >
        <colgroup>
          {table.getVisibleLeafColumns().map((column) => (
            <col key={column.id} data-col-id={column.id} style={{ width: columnWidth(column) }} />
          ))}
        </colgroup>
        {children}
      </Table>
    </DndContext>
  )
}
