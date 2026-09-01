'use client'

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import { useEntityLabels } from '@/entities/nomenclature'
import { useDndReorder } from '@/shared/lib/hooks/useDndReorder'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CloudArrowUpIcon, PlusIcon, ShapesIcon } from '@/shared/ui/icons'
import { SegmentedControl } from '@/shared/ui/molecules/segmented-control'
import { SkeletonList } from '@/shared/ui/molecules/skeleton-list'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import {
  CUSTOM_FIELD_ENTITIES,
  CUSTOM_FIELD_ENTITY_TERMS,
} from '../../../config/custom-fields.constants'
import { useFieldsPane } from '../../../model/useFieldsPane'
import { useHeaderImport } from '../../../model/useHeaderImport'

import { FieldFormDialog } from './FieldFormDialog'
import { FieldRow } from './FieldRow'
import { ImportColumnsDialog } from './ImportColumnsDialog'
import { SortableFieldRow } from './SortableFieldRow'

const SKELETON_ROWS = 3

export function FieldsPane() {
  const { t } = useTranslation()
  const entityLabel = useEntityLabels()
  const pane = useFieldsPane()
  const importer = useHeaderImport(pane.entity)
  const dnd = useDndReorder(pane.onReorder)

  const dragged = pane.fields.find((field) => field.key === dnd.activeId)

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Text as="p" variant="muted">
          {t('settings.fields.description')}
        </Text>
        <div className="flex shrink-0 items-center gap-1.5">
          <PillButton
            variant="outline"
            size="xs"
            className="gap-1.5"
            disabled={pane.isPending}
            onClick={importer.openImport}
          >
            <CloudArrowUpIcon className="size-3.5" />
            {t('settings.fields.import.cta')}
          </PillButton>
          <PillButton
            variant="outline"
            size="xs"
            className="gap-1.5"
            disabled={pane.isPending}
            onClick={pane.editor.openCreate}
          >
            <PlusIcon className="size-3.5" />
            {t('settings.fields.add')}
          </PillButton>
        </div>
      </div>

      <SegmentedControl
        value={pane.entity}
        onValueChange={pane.setEntity}
        options={CUSTOM_FIELD_ENTITIES.map((entity) => ({
          value: entity,
          label: entityLabel(CUSTOM_FIELD_ENTITY_TERMS[entity], 'plural'),
        }))}
        className="mb-4 max-w-sm"
      />

      {pane.isPending && <SkeletonList rows={SKELETON_ROWS} />}

      {!pane.isPending && pane.fields.length === 0 && (
        <EmptyState
          icon={<ShapesIcon className="size-6" />}
          title={t('settings.fields.emptyTitle')}
          description={t('settings.fields.emptyDescription')}
        >
          <PillButton size="xs" className="gap-1.5" onClick={pane.editor.openCreate}>
            <PlusIcon className="size-3.5" />
            {t('settings.fields.emptyCta')}
          </PillButton>
        </EmptyState>
      )}

      {!pane.isPending && pane.fields.length > 0 && (
        <DndContext
          id="settings-fields-dnd"
          sensors={dnd.sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={dnd.handleDragStart}
          onDragEnd={dnd.handleDragEnd}
          onDragCancel={dnd.handleDragCancel}
        >
          <SortableContext
            items={pane.fields.map((field) => field.key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1.5">
              {pane.fields.map((field) => (
                <SortableFieldRow key={field.key} field={field} actions={pane.rowActions} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay modifiers={[restrictToVerticalAxis]}>
            {dragged ? <FieldRow field={dragged} actions={pane.rowActions} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {pane.editor.open && (
        <FieldFormDialog
          open
          onOpenChange={pane.editor.setOpen}
          onSubmit={pane.onSubmit}
          initial={pane.editor.initial}
        />
      )}

      {importer.open && <ImportColumnsDialog importer={importer} />}
    </div>
  )
}
