'use client'

import { closestCenter, DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { useTaxonomyPane } from '../../../model/useTaxonomyPane'

import { AddOptionInput } from './AddOptionInput'
import { TaxonomyOptionRow } from './TaxonomyOptionRow'

import type { TaxonomyKind } from '../../../lib/taxonomy-edit'

const SKELETON_ROWS = 5

export function TaxonomyPane({ kind }: Readonly<{ kind: TaxonomyKind }>) {
  const { t } = useTranslation()
  const pane = useTaxonomyPane(kind)

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-muted-foreground">
        {t(`settings.taxonomy.${pane.namespace}Description`)}
      </p>

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
              <div className="flex flex-col gap-1.5">
                {pane.options.map((option) => (
                  <TaxonomyOptionRow
                    key={option.key}
                    option={option}
                    fallbackLabel={t(`contacts.${pane.namespace}.${option.key}`, {
                      defaultValue: option.key,
                    })}
                    actions={pane.actions}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </TooltipProvider>
      )}

      <AddOptionInput
        form={{ value: pane.newLabel, onChange: pane.setNewLabel, onSubmit: pane.handleAdd }}
        placeholder={t(`settings.taxonomy.${pane.namespace}AddPlaceholder`)}
        label={t('settings.taxonomy.add')}
        disabled={pane.isLoading}
      />
    </div>
  )
}
