'use client'

import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { DotsSixVerticalIcon, XIcon } from '@/shared/ui/icons'
import { ColorSwatchPicker } from '@/shared/ui/molecules/color-swatch-picker'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'
import { Slider } from '@/shared/ui/shadcn/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
            aria-label={t(`${s}.dragToReorder`)}
            {...handle?.attributes}
            {...handle?.listeners}
          >
            <DotsSixVerticalIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{t(`${s}.dragToReorder`)}</TooltipContent>
      </Tooltip>

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

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2.5">
            <Slider
              min={0}
              max={100}
              step={5}
              value={[stage.probability]}
              onValueChange={([v]) => actions.onUpdate(stage.id, { probability: v })}
              className="w-24 **:data-[slot=slider-thumb]:cursor-grab **:data-[slot=slider-thumb]:active:cursor-grabbing"
            />
            <span className="w-9 text-right text-xs font-bold tabular-nums text-primary-deep dark:text-primary">
              {stage.probability}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">{t(`${s}.closeProbability`)}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => actions.onRemove(stage.id)}
            aria-label={t(`${s}.removeStage`)}
            className="size-6 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <XIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{t(`${s}.removeStage`)}</TooltipContent>
      </Tooltip>
    </div>
  )
}
