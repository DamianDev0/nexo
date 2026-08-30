'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { CountHint } from '@/shared/ui/atoms/count-hint'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { CaretDownIcon, StarIcon, TrashIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { StageEditor } from './StageEditor'

import type { PipelineCardActions } from '../../../model/types'
import type { Pipeline } from '@repo/shared-types'

interface PipelineCardProps {
  readonly pipeline: Pipeline
  readonly expanded: boolean
  readonly actions: PipelineCardActions
}

export function PipelineCard({ pipeline, expanded, actions }: Readonly<PipelineCardProps>) {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <PillButton
          variant="ghost"
          size="xs"
          className="w-8 px-0"
          aria-label={expanded ? t('settings.pipelines.collapse') : t('settings.pipelines.expand')}
          onClick={() => actions.onToggleExpand(pipeline.id)}
        >
          <CaretDownIcon
            className={cn('size-4 transition-transform', expanded && 'rotate-180')}
          />
        </PillButton>

        <Input
          key={`${pipeline.id}:${pipeline.name}`}
          defaultValue={pipeline.name}
          aria-label={t('settings.pipelines.nameLabel')}
          className="h-8 flex-1 bg-background text-sm font-medium"
          onBlur={(event) => {
            const value = event.target.value.trim()
            if (value.length > 0 && value !== pipeline.name) {
              actions.onRename(pipeline.id, value)
            }
          }}
        />

        {pipeline.isDefault ? (
          <BadgeSoft tone="positive">{t('settings.pipelines.default')}</BadgeSoft>
        ) : (
          <HintTooltip asChild hint={t('settings.pipelines.setDefault')}>
            <PillButton
              variant="ghost"
              size="xs"
              className="w-8 px-0 text-muted-foreground hover:text-primary"
              aria-label={t('settings.pipelines.setDefault')}
              onClick={() => actions.onSetDefault(pipeline.id)}
            >
              <StarIcon className="size-3.5" />
            </PillButton>
          </HintTooltip>
        )}

        <CountHint
          count={pipeline.stages.length}
          label={t('settings.pipelines.stageCount', { count: pipeline.stages.length })}
        />

        <PillButton
          variant="ghostDanger"
          size="xs"
          aria-label={t('settings.pipelines.remove')}
          onClick={() => actions.onRequestRemove(pipeline.id)}
        >
          <TrashIcon className="size-3.5" />
        </PillButton>
      </div>

      {expanded && (
        <div className="border-t border-border p-2.5">
          <StageEditor pipeline={pipeline} onSave={actions.onSaveStages} />
        </div>
      )}
    </div>
  )
}
