'use client'

import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { LayoutGroup } from 'motion/react'
import { useId, useMemo } from 'react'

import { cn } from '@/shared/lib'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { DATA_TABLE_GUTTER } from '../../config/table.constants'
import { SMART_LIST_DROP_ANIMATION, SMART_LIST_HOTKEY_LIMIT } from '../config/smart-list.constants'
import { useSmartListHotkeys } from '../model/use-smart-list-hotkeys'
import { useSmartListNavigation } from '../model/use-smart-list-navigation'
import { useSmartListReorder } from '../model/use-smart-list-reorder'
import { useSmartListReveal } from '../model/use-smart-list-reveal'
import { useSmartListViewport } from '../model/use-smart-list-viewport'

import { SmartListTab, SmartListTabGhost } from './smart-list-tab'

import type { SmartListItem, SmartListMenuAction, SmartListsData } from '../model/smart-list.types'
import type { ReactNode } from 'react'

export interface SmartListsActions {
  readonly onSelect: (id: string) => void
  readonly onReorder?: (ids: readonly string[]) => void
  readonly itemMenu?: (item: SmartListItem) => ReadonlyArray<SmartListMenuAction>
  readonly menuLabel?: string
}

interface SmartListsProps {
  readonly data: SmartListsData
  readonly actions: SmartListsActions
  readonly hotkeys?: boolean
  readonly children?: ReactNode
  readonly className?: string
}

export function DataTableSmartLists({
  data,
  actions,
  hotkeys = false,
  children,
  className,
}: Readonly<SmartListsProps>) {
  const { onSelect, onReorder, itemMenu, menuLabel } = actions
  const instanceId = useId()
  const ids = useMemo(() => data.items.map((item) => item.id), [data.items])
  const hasPinned = data.items.some((item) => item.pinned)

  const reorder = useSmartListReorder(data.items, onReorder)
  const viewport = useSmartListViewport(data.items.length, hasPinned)
  const onKeyDown = useSmartListNavigation(ids, data.activeId, onSelect)
  const tabActions = useMemo(
    () => ({ onSelect, onKeyDown, itemMenu, menuLabel }),
    [onSelect, onKeyDown, itemMenu, menuLabel],
  )

  useSmartListReveal(viewport.ref, data.activeId, viewport.pinnedWidth)
  useSmartListHotkeys(ids, onSelect, hotkeys)

  return (
    <TooltipProvider>
      <div
        data-slot="table-smart-lists"
        className={cn(
          'flex items-center gap-1 border-b border-border',
          DATA_TABLE_GUTTER,
          className,
        )}
      >
        <div
          ref={viewport.ref}
          className="min-w-0 flex-1 overflow-x-auto scrollbar-hidden"
          style={viewport.style}
        >
          <DndContext
            id={instanceId}
            sensors={reorder.sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis]}
            onDragStart={reorder.handleDragStart}
            onDragEnd={reorder.handleDragEnd}
            onDragCancel={reorder.handleDragCancel}
          >
            <SortableContext items={reorder.movableIds} strategy={horizontalListSortingStrategy}>
              <LayoutGroup id={instanceId}>
                <span
                  role="tablist"
                  aria-orientation="horizontal"
                  data-slot="smart-list-track"
                  className="flex w-max items-center"
                >
                  {data.items.map((item, index) => (
                    <SmartListTab
                      key={item.id}
                      item={item}
                      active={item.id === data.activeId}
                      sortable={reorder.sortable && !item.pinned}
                      hotkey={hotkeys && index < SMART_LIST_HOTKEY_LIMIT ? index + 1 : undefined}
                      actions={tabActions}
                    />
                  ))}
                </span>
              </LayoutGroup>
            </SortableContext>
            <DragOverlay dropAnimation={SMART_LIST_DROP_ANIMATION}>
              {reorder.draggingItem ? <SmartListTabGhost item={reorder.draggingItem} /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {children && (
          <span className="ml-auto flex shrink-0 items-center gap-2 py-1.5 pl-3">{children}</span>
        )}
      </div>
    </TooltipProvider>
  )
}
