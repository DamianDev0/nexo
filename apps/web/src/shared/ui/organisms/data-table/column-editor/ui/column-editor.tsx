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
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { SlidersHorizontalIcon } from '@/shared/ui/icons'
import { EdgeCollapseButton } from '@/shared/ui/molecules/edge-collapse-button'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/shadcn/sheet'

import { DATA_TABLE_TOOLBAR_BUTTON } from '../../config/table.constants'
import { useColumnEditor } from '../model/use-column-editor'

import { ColumnEditorRow } from './column-editor-item'

export function DataTableColumnEditor({ className }: Readonly<{ className?: string }>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { items, visibleCount, toggle, reorder, showAll, resetWidths } = useColumnEditor()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const dndId = useId()

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) reorder(String(active.id), String(over.id))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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

      <SheetContent showCloseButton={false} className="w-full gap-0 overflow-visible sm:max-w-md">
        <EdgeCollapseButton
          edge="left"
          label={t('common.table.collapsePanel')}
          onClick={() => setOpen(false)}
        />
        <SheetHeader className="gap-0.5 border-b border-border px-6 pb-4 pt-5">
          <SheetTitle className="text-lg font-bold tracking-[-0.01em]">
            {t('common.table.editColumns')}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {t('common.table.editColumnsHint')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
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

          <SheetFooter className="-mx-6 -mb-5 mt-auto flex-row items-center justify-end gap-2 border-t border-border px-6 py-3">
            <PillButton variant="ghost" size="sm" onClick={resetWidths}>
              {t('common.table.resetWidths')}
            </PillButton>
            <PillButton variant="tertiary" size="sm" onClick={showAll}>
              {t('common.table.showAllColumns')}
            </PillButton>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
