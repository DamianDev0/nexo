'use client'

import { closestCenter, DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import { PlusIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { useTaxonomyPane } from '../../../model/useTaxonomyPane'

import { TaxonomyOptionRow } from './TaxonomyOptionRow'

import type { TaxonomyKind } from '../../../lib/taxonomy-edit'

export function TaxonomyPane({ kind }: Readonly<{ kind: TaxonomyKind }>) {
  const { t } = useTranslation()
  const pane = useTaxonomyPane(kind)

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-muted-foreground">
        {t(`settings.taxonomy.${pane.namespace}Description`)}
      </p>

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

      <div className="mt-4 flex items-center gap-2">
        <Input
          className="h-9 max-w-xs text-sm"
          value={pane.newLabel}
          placeholder={t(`settings.taxonomy.${pane.namespace}AddPlaceholder`)}
          onChange={(e) => pane.setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              pane.handleAdd()
            }
          }}
        />
        <Button variant="outline" size="sm" className="gap-1.5" onClick={pane.handleAdd}>
          <PlusIcon className="size-3.5" />
          {t('settings.taxonomy.add')}
        </Button>
      </div>
    </div>
  )
}
