'use client'

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { CaretRightIcon, SlidersHorizontalIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/shadcn/sheet'

import { DATA_TABLE_TOOLBAR_BUTTON } from '../../config/table.constants'
import { useColumnEditor } from '../model/use-column-editor'

import { ColumnEditorRow } from './column-editor-item'

export function DataTableColumnEditor({ className }: Readonly<{ className?: string }>) {
  const { t } = useTranslation()
  const { items, visibleCount, toggle, reorder, showAll, resetWidths } = useColumnEditor()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const dndId = useId()

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) reorder(String(active.id), String(over.id))
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-slot="table-columns"
          className={cn(DATA_TABLE_TOOLBAR_BUTTON, className)}
        >
          <SlidersHorizontalIcon className="size-4" />
          {t('common.table.columns')}
          <span className="text-faint">{visibleCount}</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" showCloseButton={false} className="flex w-88 flex-col gap-0 p-0">
        <SheetHeader className="flex-row items-start gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <SheetTitle>{t('common.table.editColumns')}</SheetTitle>
            <SheetDescription>{t('common.table.editColumnsHint')}</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t('common.close')}
              className="size-7 shrink-0 text-faint hover:text-foreground"
            >
              <CaretRightIcon className="size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-0.5">
                {items.map((item) => (
                  <ColumnEditorRow key={item.id} item={item} onToggle={toggle} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex items-center gap-2 border-t border-border px-5 py-3">
          <Button variant="outline" size="sm" onClick={showAll} className="flex-1">
            {t('common.table.showAllColumns')}
          </Button>
          <Button variant="outline" size="sm" onClick={resetWidths} className="flex-1">
            {t('common.table.resetWidths')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
