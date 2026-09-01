'use client'

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { PlusIcon } from '@/shared/ui/icons'
import { MorphingPageDots } from '@/shared/ui/molecules/morphing-page-dots'
import { PagedTransition } from '@/shared/ui/molecules/paged-transition'
import { SkeletonList } from '@/shared/ui/molecules/skeleton-list'

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
  const terms = useEntityTerms('contact')
  const pane = useTaxonomyPane(kind)

  const draggedRow = pane.rows.find((row) => row.option.key === pane.dnd.activeId)

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Text as="p" variant="muted">
          {t(`settings.taxonomy.${pane.namespace}Description`, {
            entity: terms.lowerSingular,
            entities: terms.lowerPlural,
          })}
        </Text>
        <PillButton
          variant="outline"
          size="xs"
          className="shrink-0 gap-1.5"
          disabled={pane.isLoading}
          onClick={pane.editor.openCreate}
        >
          <PlusIcon className="size-3.5" />
          {t('settings.taxonomy.add')}
        </PillButton>
      </div>

      {pane.isLoading ? (
        <SkeletonList rows={SKELETON_ROWS} />
      ) : (
        <DndContext
          id="settings-taxonomy-dnd"
          sensors={pane.dnd.sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={pane.dnd.handleDragStart}
          onDragEnd={pane.dnd.handleDragEnd}
          onDragCancel={pane.dnd.handleDragCancel}
        >
          <SortableContext
            items={pane.rows.map((row) => row.option.key)}
            strategy={verticalListSortingStrategy}
          >
            <PagedTransition page={pane.pagination.page} className="flex flex-col gap-1.5">
              {pane.rows.map((row) => (
                <SortableTaxonomyOption key={row.option.key} row={row} actions={pane.actions} />
              ))}
            </PagedTransition>
          </SortableContext>

          <DragOverlay modifiers={[restrictToVerticalAxis]} dropAnimation={DROP_ANIMATION}>
            {draggedRow ? (
              <TaxonomyOptionRow ghost row={draggedRow} actions={pane.actions} />
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
          confirm={{ action: pane.removal.confirm, isPending: pane.removal.isPending }}
        />
      )}
    </div>
  )
}
