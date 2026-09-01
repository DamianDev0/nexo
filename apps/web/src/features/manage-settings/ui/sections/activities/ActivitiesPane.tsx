'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { PlusIcon } from '@/shared/ui/icons'
import { SkeletonList } from '@/shared/ui/molecules/skeleton-list'

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
        <PillButton
          variant="outline"
          size="xs"
          className="shrink-0 gap-1.5"
          disabled={pane.isPending}
          onClick={pane.creator.openCreate}
        >
          <PlusIcon className="size-3.5" />
          {t('settings.activityTypes.add')}
        </PillButton>
      </div>

      {pane.isPending ? (
        <SkeletonList rows={SKELETON_ROWS} />
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
