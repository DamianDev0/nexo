'use client'

import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'

import { cn } from '@/shared/lib'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { SmartListTab } from './smart-list-tab'

import type { DragEndEvent } from '@dnd-kit/core'
import type { ReactNode } from 'react'

export interface SmartListItem {
  readonly id: string
  readonly label: string
  readonly count?: number
  readonly description?: string
}

interface SmartListsData {
  readonly items: ReadonlyArray<SmartListItem>
  readonly activeId: string
}

interface SmartListsProps {
  readonly data: SmartListsData
  readonly onSelect: (id: string) => void
  readonly onReorder?: (ids: readonly string[]) => void
  readonly children?: ReactNode
  readonly className?: string
}

export function DataTableSmartLists({
  data,
  onSelect,
  onReorder,
  children,
  className,
}: Readonly<SmartListsProps>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const sortable = onReorder !== undefined

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = data.items.map((item) => item.id)
    onReorder?.(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  return (
    <TooltipProvider>
      <div
        data-slot="table-smart-lists"
        className={cn(
          'flex items-center gap-1 overflow-x-auto border-b border-border px-4',
          className,
        )}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={data.items.map((item) => item.id)}
            strategy={horizontalListSortingStrategy}
          >
            <span className="flex items-center divide-x divide-border">
              {data.items.map((item) => (
                <SmartListTab
                  key={item.id}
                  item={item}
                  active={item.id === data.activeId}
                  sortable={sortable}
                  onSelect={onSelect}
                />
              ))}
            </span>
          </SortableContext>
        </DndContext>
        {children && (
          <span className="ml-auto flex items-center gap-2 py-1.5 pl-3">{children}</span>
        )}
      </div>
    </TooltipProvider>
  )
}
