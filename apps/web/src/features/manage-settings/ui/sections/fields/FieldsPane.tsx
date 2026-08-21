'use client'

import { useTranslation } from 'react-i18next'

import { PlusIcon, ShapesIcon } from '@/shared/ui/icons'
import { SegmentedControl } from '@/shared/ui/molecules/segmented-control'
import { EmptyState } from '@/shared/ui/organisms/empty-state'
import { Button } from '@/shared/ui/shadcn/button'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { CUSTOM_FIELD_ENTITIES } from '../../../config/custom-fields.constants'
import { useFieldsPane } from '../../../model/useFieldsPane'

import { FieldFormDialog } from './FieldFormDialog'
import { FieldRow } from './FieldRow'

const SKELETON_ROWS = 3

export function FieldsPane() {
  const { t } = useTranslation()
  const pane = useFieldsPane()

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t('settings.fields.description')}</p>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={pane.isPending}
          onClick={() => pane.editor.setOpen(true)}
        >
          <PlusIcon className="size-3.5" />
          {t('settings.fields.add')}
        </Button>
      </div>

      <SegmentedControl
        value={pane.entity}
        onValueChange={pane.setEntity}
        options={CUSTOM_FIELD_ENTITIES.map((entity) => ({
          value: entity,
          label: t(`settings.fields.entities.${entity}`),
        }))}
        className="mb-4 max-w-sm"
      />

      {pane.isPending && (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => `row-${index}`).map((key) => (
            <Skeleton key={key} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!pane.isPending && pane.fields.length === 0 && (
        <EmptyState
          icon={<ShapesIcon className="size-6" />}
          title={t('settings.fields.emptyTitle')}
          description={t('settings.fields.emptyDescription')}
        />
      )}

      {!pane.isPending && (
        <div className="flex flex-col gap-1.5">
          {pane.fields.map((field) => (
            <FieldRow key={field.key} field={field} onArchive={pane.onArchive} />
          ))}
        </div>
      )}

      {pane.editor.open && (
        <FieldFormDialog open onOpenChange={pane.editor.setOpen} onSubmit={pane.onSubmit} />
      )}
    </div>
  )
}
