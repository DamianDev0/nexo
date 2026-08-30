'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from '@/shared/ui/icons'
import { ColorSwatchPicker } from '@/shared/ui/molecules/color-swatch-picker'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { HEX_COLOR_PALETTE } from '../../../config/hex-palette.constants'
import {
  MAX_STAGE_PROBABILITY,
  STAGE_NAME_MAX,
} from '../../../config/pipelines.constants'
import { clampProbability } from '../../../lib/stage-edit'

import type { StageDraft } from '../../../lib/stage-edit'
import type { StageEditorRowActions, StageRowState } from '../../../model/types'

interface StageEditorRowProps {
  readonly stage: StageDraft
  readonly state: StageRowState
  readonly actions: StageEditorRowActions
}

export function StageEditorRow({ stage, state, actions }: Readonly<StageEditorRowProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5">
      <div className="flex flex-col">
        <PillButton
          variant="ghost"
          size="xs"
          className="h-4 w-6 px-0"
          aria-label={t('settings.pipelines.moveUp')}
          disabled={state.first}
          onClick={() => actions.onMove(stage.id, -1)}
        >
          <ArrowUpIcon className="size-3" />
        </PillButton>
        <PillButton
          variant="ghost"
          size="xs"
          className="h-4 w-6 px-0"
          aria-label={t('settings.pipelines.moveDown')}
          disabled={state.last}
          onClick={() => actions.onMove(stage.id, 1)}
        >
          <ArrowDownIcon className="size-3" />
        </PillButton>
      </div>

      <ColorSwatchPicker
        color={stage.color}
        colors={HEX_COLOR_PALETTE}
        onChange={(color) => actions.onUpdate(stage.id, { color })}
        label={t('settings.pipelines.stageColor')}
      />

      <Input
        value={stage.name}
        maxLength={STAGE_NAME_MAX}
        aria-label={t('settings.pipelines.stageName')}
        className="h-8 flex-1 text-sm font-medium"
        onChange={(event) => actions.onUpdate(stage.id, { name: event.target.value })}
      />

      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          max={MAX_STAGE_PROBABILITY}
          value={stage.probability}
          aria-label={t('settings.pipelines.probability')}
          className="h-8 w-16 text-right text-sm tabular-nums"
          onChange={(event) =>
            actions.onUpdate(stage.id, { probability: clampProbability(event.target.value) })
          }
        />
        <Text variant="hint">%</Text>
      </div>

      <PillButton
        variant="ghostDanger"
        size="xs"
        aria-label={t('settings.pipelines.removeStage')}
        onClick={() => actions.onRemove(stage.id)}
      >
        <TrashIcon className="size-3.5" />
      </PillButton>
    </div>
  )
}
