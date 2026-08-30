'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { PlusIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { useActivityTypesPane } from '../../../model/useActivityTypesPane'

import { ActivityTypeFormDialog } from './ActivityTypeFormDialog'
import { ActivityTypeRow } from './ActivityTypeRow'

const SKELETON_ROWS = 5

export function ActivitiesPane() {
  const { t } = useTranslation()
  const pane = useActivityTypesPane()

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Text as="p" variant="muted">
          {t('settings.activityTypes.description')}
        </Text>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={pane.isPending}
          onClick={pane.creator.openCreate}
        >
          <PlusIcon className="size-3.5" />
          {t('settings.activityTypes.add')}
        </Button>
      </div>

      {pane.isPending ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => `row-${index}`).map((key) => (
            <Skeleton key={key} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {pane.types.map((type) => (
            <ActivityTypeRow key={type.key} type={type} actions={pane.actions} />
          ))}
        </div>
      )}

      {pane.creator.open && (
        <ActivityTypeFormDialog
          open
          onOpenChange={pane.creator.onOpenChange}
          onSubmit={pane.creator.onSubmit}
        />
      )}
    </div>
  )
}
