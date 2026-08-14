'use client'

import { closestCenter, DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { PlusIcon } from '@/shared/ui/icons'
import { MorphingPageDots } from '@/shared/ui/molecules/morphing-page-dots'
import { Button } from '@/shared/ui/shadcn/button'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { useTaxonomyPane } from '../../../model/useTaxonomyPane'

import { OptionFormDialog } from './OptionFormDialog'
import { ReassignOptionDialog } from './ReassignOptionDialog'
import { TaxonomyOptionRow } from './TaxonomyOptionRow'

import type { TaxonomyKind } from '../../../lib/taxonomy-edit'

const SKELETON_ROWS = 5

export function TaxonomyPane({ kind }: Readonly<{ kind: TaxonomyKind }>) {
  const { t } = useTranslation()
  const pane = useTaxonomyPane(kind)
  const pageTransition = useReducedTransition(quickEase)

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t(`settings.taxonomy.${pane.namespace}Description`)}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={pane.isLoading}
          onClick={pane.editor.openCreate}
        >
          <PlusIcon className="size-3.5" />
          {t('settings.taxonomy.add')}
        </Button>
      </div>

      {pane.isLoading ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => `row-${index}`).map((key) => (
            <Skeleton key={key} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <TooltipProvider delayDuration={400}>
          <DndContext
            sensors={pane.dnd.sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={pane.dnd.handleDragStart}
            onDragEnd={pane.dnd.handleDragEnd}
            onDragCancel={pane.dnd.handleDragCancel}
          >
            <SortableContext
              items={pane.options.map((option) => option.key)}
              strategy={verticalListSortingStrategy}
            >
              <motion.div
                key={pane.pagination.page}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={pageTransition}
                className="flex flex-col gap-1.5"
              >
                {pane.options.map((option) => (
                  <TaxonomyOptionRow
                    key={option.key}
                    option={option}
                    fallbackLabel={pane.optionLabel(option)}
                    count={pane.counts[option.key] ?? 0}
                    actions={pane.actions}
                  />
                ))}
              </motion.div>
            </SortableContext>
          </DndContext>
        </TooltipProvider>
      )}

      <MorphingPageDots
        total={pane.pagination.totalPages}
        page={pane.pagination.page}
        onPageChange={pane.pagination.onPageChange}
        label={t('settings.pagination.page')}
        className="mt-3"
      />

      {pane.editor.open && (
        <OptionFormDialog
          open
          onOpenChange={pane.editor.onOpenChange}
          initial={pane.editor.editing}
          namePlaceholder={t(`settings.taxonomy.${pane.namespace}AddPlaceholder`)}
          onSubmit={pane.editor.onSubmit}
        />
      )}

      {pane.removal && (
        <ReassignOptionDialog
          open
          onOpenChange={(open) => {
            if (!open) pane.removal?.cancel()
          }}
          source={pane.removal.source}
          candidates={pane.removal.candidates}
          onConfirm={pane.removal.confirm}
        />
      )}
    </div>
  )
}
