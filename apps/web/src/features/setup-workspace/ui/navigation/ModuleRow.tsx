'use client'

import { GripVertical, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui/shadcn/button'
import { Switch } from '@/shared/ui/shadcn/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import { SIDEBAR_ICON_MAP } from '../../model/icon-map.constants'

import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { SidebarModule } from '@repo/shared-types'

interface ModuleHandle {
  readonly attributes: DraggableAttributes
  readonly listeners: SyntheticListenerMap | undefined
}

export interface ModuleRowActions {
  readonly onToggle: (key: string) => void
  readonly onHover?: (key: string) => void
  readonly onLeave?: () => void
}

interface ModuleRowProps {
  readonly module: SidebarModule
  readonly actions: ModuleRowActions
  readonly handle?: ModuleHandle
  readonly ghost?: boolean
}

export function ModuleRow({ module, actions, handle, ghost }: Readonly<ModuleRowProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.navigation'
  const Icon = SIDEBAR_ICON_MAP[module.icon]
  const label = t(`nav.${module.key}`, { defaultValue: module.label })

  return (
    <div
      onMouseEnter={() => actions.onHover?.(module.key)}
      onMouseLeave={() => actions.onLeave?.()}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-[box-shadow,border-color]',
        !ghost && 'hover:border-input/70 hover:shadow-xs',
        ghost && 'scale-[1.02] shadow-xl ring-1 ring-primary/40',
        !module.enabled && 'opacity-50',
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
            <GripVertical className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{t(`${s}.dragToReorder`)}</TooltipContent>
      </Tooltip>

      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md',
          module.enabled ? 'bg-accent' : 'bg-muted',
        )}
      >
        {Icon ? <Icon className="size-4 text-accent-foreground" /> : null}
      </div>

      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {module.required && (
          <span className="ml-2 text-xs text-muted-foreground">({t(`${s}.required`)})</span>
        )}
      </div>

      {module.required ? (
        <Lock className="size-3.5 text-muted-foreground/50" />
      ) : (
        <Switch
          checked={module.enabled}
          onCheckedChange={() => actions.onToggle(module.key)}
          aria-label={`Toggle ${label}`}
        />
      )}
    </div>
  )
}
