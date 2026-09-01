'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { Text } from '@/shared/ui/atoms/text'
import { DotsSixVerticalIcon, LockIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'

import { SIDEBAR_ICON_MAP } from '../../config/module-icons.constants'

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
      data-slot="module-row"
      data-module={module.key}
      onMouseEnter={() => actions.onHover?.(module.key)}
      onMouseLeave={() => actions.onLeave?.()}
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-[box-shadow,border-color]',
        handle && 'cursor-grab touch-none active:cursor-grabbing',
        !ghost && 'hover:border-input/70 hover:shadow-xs',
        ghost && 'scale-[1.02] cursor-grabbing shadow-xl ring-1 ring-primary/40',
        !module.enabled && 'opacity-50',
      )}
      {...handle?.attributes}
      {...handle?.listeners}
    >
      <HintTooltip asChild hint={t(`${s}.dragToReorder`)}>
        <span
          className="flex size-6 shrink-0 items-center justify-center text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
          aria-label={t(`${s}.dragToReorder`)}
        >
          <DotsSixVerticalIcon className="size-4" />
        </span>
      </HintTooltip>

      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md',
          module.enabled ? 'bg-accent' : 'bg-muted',
        )}
      >
        {Icon ? <Icon className="size-4 text-accent-foreground" /> : null}
      </div>

      <div className="flex-1">
        <Text variant="strong">{label}</Text>
        {module.required && (
          <Text variant="hint" className="ml-2">
            ({t(`${s}.required`)})
          </Text>
        )}
      </div>

      {module.required ? (
        <LockIcon className="size-3.5 text-muted-foreground/50" />
      ) : (
        <AnimatedToggle
          checked={module.enabled}
          onChange={() => actions.onToggle(module.key)}
          label={`Toggle ${label}`}
        />
      )}
    </div>
  )
}
