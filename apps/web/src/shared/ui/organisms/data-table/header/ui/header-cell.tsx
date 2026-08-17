'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { flexRender } from '@tanstack/react-table'

import { cn } from '@/shared/lib/cn'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { TableHead } from '@/shared/ui/shadcn/table'

import { DATA_TABLE_SELECTION_ID } from '../../config/table.constants'
import { cellAlignment } from '../../lib/cell-align'
import { pinClasses, pinStyles } from '../../lib/pinning'

import { DragHandle } from './drag-handle'
import { HeaderMenu } from './header-menu'
import { ResizeHandle } from './resize-handle'
import { SortButton } from './sort-button'

import type { Header } from '@tanstack/react-table'

export function HeaderCell({ header }: Readonly<{ header: Header<unknown, unknown> }>) {
  const { column } = header
  const { meta } = column.columnDef
  const pinned = Boolean(column.getIsPinned())
  const movable = column.id !== DATA_TABLE_SELECTION_ID

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, disabled: !movable })

  return (
    <TableHead
      ref={setNodeRef}
      scope="col"
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        ...pinStyles(column),
      }}
      className={cn(
        'group/th relative h-9 border-b border-border bg-muted px-2 text-sm font-semibold text-body',
        cellAlignment(column.columnDef),
        pinned ? 'z-21' : 'z-20',
        pinClasses(column),
        isDragging && 'z-30 opacity-60',
      )}
    >
      <span className="flex min-w-0 items-center gap-1">
        {movable && (
          <DragHandle ref={setActivatorNodeRef} attributes={attributes} listeners={listeners} />
        )}

        <TruncateTip
          hint={meta?.description}
          className={cn(
            'flex-1 transition-[padding] duration-150',
            movable && 'group-hover/th:pl-5',
          )}
        >
          {flexRender(column.columnDef.header, header.getContext())}
        </TruncateTip>

        {column.getCanSort() && <SortButton header={header} />}
        {(column.getCanSort() || meta?.lockable) && <HeaderMenu header={header} />}
      </span>

      {column.getCanResize() && <ResizeHandle header={header} />}
    </TableHead>
  )
}
