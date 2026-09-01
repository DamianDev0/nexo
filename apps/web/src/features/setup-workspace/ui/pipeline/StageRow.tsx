'use client'

import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { DotsSixVerticalIcon, XIcon } from '@/shared/ui/icons'
import { ColorSwatchPicker } from '@/shared/ui/molecules/color-swatch-picker'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Slider } from '@/shared/ui/shadcn/slider'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { CreatePipelineRequest } from '@repo/shared-types'

export type Stage = Readonly<CreatePipelineRequest['stages'][number] & { id: string }>

export interface StageRowActions {
  readonly onUpdate: (id: string, patch: Partial<Omit<Stage, 'id'>>) => void
  readonly onRemove: (id: string) => void
}

interface StageHandle {
  readonly attributes: DraggableAttributes
  readonly listeners: SyntheticListenerMap | undefined
}

interface StageRowProps {
  readonly stage: Stage
  readonly actions: StageRowActions
  readonly handle?: StageHandle
  readonly ghost?: boolean
}

export function StageRow({ stage, actions, handle, ghost }: Readonly<StageRowProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.pipeline'

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 transition-shadow',
        ghost && 'scale-[1.02] shadow-xl ring-1 ring-primary/40',
      )}
    >
      <HintTooltip asChild hint={t(`${s}.dragToReorder`)}>
        <PillButton
          variant="ghost"
          size="xs"
          className="size-6 px-0 shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          aria-label={t(`${s}.dragToReorder`)}
          {...handle?.attributes}
          {...handle?.listeners}
        >
          <DotsSixVerticalIcon className="size-4" />
        </PillButton>
      </HintTooltip>

      <ColorSwatchPicker
        color={stage.color}
        colors={TAXONOMY_COLOR_PALETTE}
        onChange={(color) => actions.onUpdate(stage.id, { color })}
        label={t(`${s}.stageColor`)}
      />

      <Input
        className="h-8 flex-1 bg-background text-sm font-medium"
        value={stage.name}
        aria-label={t(`${s}.stageName`)}
        onChange={(e) => actions.onUpdate(stage.id, { name: e.target.value })}
      />

      <HintTooltip asChild hint={t(`${s}.closeProbability`)}>
        <div className="flex items-center gap-2.5">
          <Slider
            min={0}
            max={100}
            step={5}
            value={[stage.probability]}
            onValueChange={([v]) => actions.onUpdate(stage.id, { probability: v })}
            className="w-24 **:data-[slot=slider-thumb]:cursor-grab **:data-[slot=slider-thumb]:active:cursor-grabbing"
          />
          <Text
            variant="bold"
            className="w-9 text-right text-xs tabular-nums text-primary-deep dark:text-primary"
          >
            {stage.probability}%
          </Text>
        </div>
      </HintTooltip>

      <HintTooltip asChild hint={t(`${s}.removeStage`)}>
        <PillButton
          variant="ghostDanger"
          size="xs"
          onClick={() => actions.onRemove(stage.id)}
          aria-label={t(`${s}.removeStage`)}
          className="size-6 rounded-full px-0"
        >
          <XIcon className="size-3.5" />
        </PillButton>
      </HintTooltip>
    </div>
  )
}
