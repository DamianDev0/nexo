'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { LayoutGroup } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/shared/lib'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { SmartListTab, SmartListTabGhost } from './smart-list-tab'

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
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

function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null)
  const [fade, setFade] = useState({ left: false, right: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const left = el.scrollLeft > 4
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
      setFade((prev) => (prev.left === left && prev.right === right ? prev : { left, right }))
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  const maskImage =
    fade.left || fade.right
      ? `linear-gradient(to right, ${fade.left ? 'transparent, black 3rem' : 'black'}, black calc(100% - ${fade.right ? '3rem' : '0px'}), ${fade.right ? 'transparent' : 'black'})`
      : undefined

  return { ref, maskImage }
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
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const draggingItem = data.items.find((item) => item.id === draggingId)
  const { ref: scrollRef, maskImage } = useScrollFade()
  const layoutGroupId = useId()

  const handleDragStart = ({ active }: DragStartEvent) => setDraggingId(String(active.id))

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggingId(null)
    if (!over || active.id === over.id) return
    const ids = data.items.map((item) => item.id)
    onReorder?.(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  return (
    <TooltipProvider>
      <div
        data-slot="table-smart-lists"
        className={cn('flex items-center gap-1 border-b border-border px-4', className)}
      >
        <div
          ref={scrollRef}
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ maskImage, WebkitMaskImage: maskImage }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDraggingId(null)}
          >
            <SortableContext
              items={data.items.map((item) => item.id)}
              strategy={horizontalListSortingStrategy}
            >
              <LayoutGroup id={layoutGroupId}>
                <span className="flex w-max items-center divide-x divide-border">
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
              </LayoutGroup>
            </SortableContext>
            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
              {draggingItem ? <SmartListTabGhost item={draggingItem} /> : null}
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
