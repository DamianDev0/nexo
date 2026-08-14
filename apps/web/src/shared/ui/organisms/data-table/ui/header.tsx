'use client'

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { flexRender, type Header } from '@tanstack/react-table'
import { useId } from 'react'

import { cn } from '@/shared/lib'
import { ArrowDownIcon, ArrowUpIcon, CaretUpDownIcon } from '@/shared/ui/icons'

import { DATA_TABLE_GUTTER } from '../config/table.constants'
import { useDataTableContext } from '../model/context'

import { cellAlignment } from './cell-align'

function SortIndicator({ direction }: Readonly<{ direction: false | 'asc' | 'desc' }>) {
  if (direction === 'asc') return <ArrowUpIcon className="size-3 shrink-0 text-foreground" />
  if (direction === 'desc') return <ArrowDownIcon className="size-3 shrink-0 text-foreground" />
  return (
    <CaretUpDownIcon className="size-3 shrink-0 opacity-40 transition-opacity group-hover/th:opacity-100" />
  )
}

function HeaderCell({ header }: Readonly<{ header: Header<unknown, unknown> }>) {
  const sortable = header.column.getCanSort()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
    disabled: !sortable,
  })

  const label = flexRender(header.column.columnDef.header, header.getContext())

  return (
    <div
      ref={setNodeRef}
      style={{
        width: header.getSize(),
        flexGrow: header.column.columnDef.meta?.grow ? 1 : 0,
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(
        'group/th flex min-w-0 shrink-0 items-center px-2',
        cellAlignment(header.column.columnDef),
        isDragging && 'z-10 opacity-60',
      )}
    >
      {sortable ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          className="-mx-1.5 flex min-w-0 cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-sm font-semibold text-body transition-colors hover:bg-muted hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <span className="truncate">{label}</span>
          <SortIndicator direction={header.column.getIsSorted()} />
        </button>
      ) : (
        <span className="min-w-0 truncate py-1 text-sm font-semibold text-body">{label}</span>
      )}
    </div>
  )
}

export function DataTableHeader({ className }: Readonly<{ className?: string }>) {
  const { table, reorderColumn } = useDataTableContext()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const dndId = useId()

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) reorderColumn(String(active.id), String(over.id))
  }

  const headerGroup = table.getHeaderGroups()[0]
  if (!headerGroup) return null

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={headerGroup.headers.map((header) => header.column.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div
          data-slot="table-header"
          className={cn(
            'flex h-9 items-center gap-2 border-y border-border bg-muted/35',
            DATA_TABLE_GUTTER,
            className,
          )}
        >
          {headerGroup.headers.map((header) => (
            <HeaderCell key={header.id} header={header} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
