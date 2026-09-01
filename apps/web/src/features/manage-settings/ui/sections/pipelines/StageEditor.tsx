'use client'

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { PlusIcon } from '@/shared/ui/icons'

import { useStageEditor } from '../../../model/useStageEditor'

import { StageEditorRow } from './StageEditorRow'

import type { PipelineCardActions, StageSaveHandler } from '../../../model/types'
import type { Pipeline } from '@repo/shared-types'

interface StageEditorProps {
  readonly pipeline: Pipeline
  readonly onSave: PipelineCardActions['onSaveStages']
}

export function StageEditor({ pipeline, onSave }: Readonly<StageEditorProps>) {
  const { t } = useTranslation()
  const save = useCallback<StageSaveHandler>(
    (stages) => onSave(pipeline.id, stages),
    [onSave, pipeline.id],
  )
  const editor = useStageEditor({ stages: pipeline.stages, onSave: save })

  return (
    <div className="flex flex-col gap-1.5">
      {editor.drafts.map((stage, index) => (
        <StageEditorRow
          key={stage.id}
          stage={stage}
          state={{ first: index === 0, last: index === editor.drafts.length - 1 }}
          actions={{ onUpdate: editor.update, onRemove: editor.remove, onMove: editor.move }}
        />
      ))}

      <div className="mt-1 flex items-center gap-2">
        <PillButton variant="outline" size="xs" className="gap-1.5" onClick={editor.add}>
          <PlusIcon className="size-3.5" />
          {t('settings.pipelines.addStage')}
        </PillButton>
        <div className="flex-1" />
        <PillButton variant="ghost" size="xs" disabled={!editor.dirty} onClick={editor.discard}>
          {t('settings.discard')}
        </PillButton>
        <PillButton size="xs" disabled={!editor.dirty || !editor.valid} onClick={editor.save}>
          {t('settings.pipelines.saveStages')}
        </PillButton>
      </div>
    </div>
  )
}
