'use client'

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import { PlusIcon } from '@/shared/ui/icons'
import { MorphingPageDots } from '@/shared/ui/molecules/morphing-page-dots'
import { PagedTransition } from '@/shared/ui/molecules/paged-transition'
import { Button } from '@/shared/ui/shadcn/button'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { useTaxonomyPane } from '../../../model/useTaxonomyPane'

import { OptionFormDialog } from './OptionFormDialog'
import { ReassignOptionDialog } from './ReassignOptionDialog'
import { SortableTaxonomyOption } from './SortableTaxonomyOption'
import { TaxonomyOptionRow } from './TaxonomyOptionRow'

import type { TaxonomyKind } from '../../../lib/taxonomy-edit'

const SKELETON_ROWS = 5

const DROP_ANIMATION = {
  duration: 220,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
}

export function TaxonomyPane({ kind }: Readonly<{ kind: TaxonomyKind }>) {
  const { t } = useTranslation()
  const pane = useTaxonomyPane(kind)

  const dragged = pane.options.find((option) => option.key === pane.dnd.activeId)

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
            <PagedTransition page={pane.pagination.page} className="flex flex-col gap-1.5">
              {pane.options.map((option) => (
                <SortableTaxonomyOption
                  key={option.key}
                  row={{
                    option,
                    label: pane.optionLabel(option),
                    count: pane.counts[option.key] ?? 0,
                  }}
                  actions={pane.actions}
                />
              ))}
            </PagedTransition>
          </SortableContext>

          <DragOverlay modifiers={[restrictToVerticalAxis]} dropAnimation={DROP_ANIMATION}>
            {dragged ? (
              <TaxonomyOptionRow
                ghost
                row={{
                  option: dragged,
                  label: pane.optionLabel(dragged),
                  count: pane.counts[dragged.key] ?? 0,
                }}
                actions={pane.actions}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
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
