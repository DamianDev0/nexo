'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { PlusIcon, StackIcon } from '@/shared/ui/icons'
import { EmptyState } from '@/shared/ui/organisms/empty-state'
import { Button } from '@/shared/ui/shadcn/button'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

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
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={pane.isPending}
          onClick={pane.creator.openCreate}
        >
          <PlusIcon className="size-3.5" />
          {t('settings.pipelines.add')}
        </Button>
      </div>

      {pane.isPending && (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => `row-${index}`).map((key) => (
            <Skeleton key={key} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!pane.isPending && pane.pipelines.length === 0 && (
        <EmptyState
          icon={<StackIcon className="size-6" />}
          title={t('settings.pipelines.emptyTitle')}
          description={t('settings.pipelines.emptyDescription')}
        >
          <Button size="sm" className="gap-1.5" onClick={pane.creator.openCreate}>
            <PlusIcon className="size-3.5" />
            {t('settings.pipelines.emptyCta')}
          </Button>
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
