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
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/shared/lib'

import { useDataTableContext } from './context'

function SortIndicator({ direction }: Readonly<{ direction: false | 'asc' | 'desc' }>) {
  if (direction === 'asc') return <ArrowUp className="size-3.5" />
  if (direction === 'desc') return <ArrowDown className="size-3.5" />
  return <ChevronsUpDown className="size-3.5 opacity-40" />
}

function HeaderCell({ header }: Readonly<{ header: Header<unknown, unknown> }>) {
  const sortable = header.column.getCanSort()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
    disabled: !sortable,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: header.getSize(),
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn('flex shrink-0 items-center px-1.5', isDragging && 'z-10 opacity-60')}
    >
      {sortable ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          className="flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-faint hover:bg-muted hover:text-body"
          {...attributes}
          {...listeners}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          <SortIndicator direction={header.column.getIsSorted()} />
        </button>
      ) : (
        <span className="flex items-center px-1 py-1">
          {flexRender(header.column.columnDef.header, header.getContext())}
        </span>
      )}
    </div>
  )
}

export function DataTableHeader({ className }: Readonly<{ className?: string }>) {
  const { table, reorderColumn } = useDataTableContext()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) reorderColumn(String(active.id), String(over.id))
  }

  const headerGroup = table.getHeaderGroups()[0]
  if (!headerGroup) return null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={headerGroup.headers.map((header) => header.column.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div
          data-slot="table-header"
          className={cn('flex h-11 items-center gap-2 border-b border-border px-4', className)}
        >
          {headerGroup.headers.map((header) => (
            <HeaderCell key={header.id} header={header} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
