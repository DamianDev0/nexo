'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { PlusIcon, StackIcon } from '@/shared/ui/icons'
import { SkeletonList } from '@/shared/ui/molecules/skeleton-list'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { usePipelinesPane } from '../../../model/usePipelinesPane'

import { CreatePipelineDialog } from './CreatePipelineDialog'
import { DeletePipelineDialog } from './DeletePipelineDialog'
import { PipelineCard } from './PipelineCard'

const SKELETON_ROWS = 3

export function PipelinesPane() {
  const { t } = useTranslation()
  const pane = usePipelinesPane()

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Text as="p" variant="muted">
          {t('settings.pipelines.description')}
        </Text>
        <PillButton
          variant="outline"
          size="xs"
          className="shrink-0 gap-1.5"
          disabled={pane.isPending}
          onClick={pane.creator.openCreate}
        >
          <PlusIcon className="size-3.5" />
          {t('settings.pipelines.add')}
        </PillButton>
      </div>

      {pane.isPending && <SkeletonList rows={SKELETON_ROWS} />}

      {!pane.isPending && pane.pipelines.length === 0 && (
        <EmptyState
          icon={<StackIcon className="size-6" />}
          title={t('settings.pipelines.emptyTitle')}
          description={t('settings.pipelines.emptyDescription')}
        >
          <PillButton size="xs" className="gap-1.5" onClick={pane.creator.openCreate}>
            <PlusIcon className="size-3.5" />
            {t('settings.pipelines.emptyCta')}
          </PillButton>
        </EmptyState>
      )}

      {!pane.isPending && pane.pipelines.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {pane.pipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              expanded={pane.expandedId === pipeline.id}
              actions={pane.actions}
            />
          ))}
        </div>
      )}

      {pane.creator.open && (
        <CreatePipelineDialog
          open
          onOpenChange={pane.creator.onOpenChange}
          onSubmit={pane.creator.onSubmit}
        />
      )}

      {pane.removal && (
        <DeletePipelineDialog
          name={pane.removal.name}
          onCancel={pane.removal.cancel}
          onConfirm={pane.removal.confirm}
        />
      )}
    </div>
  )
}
