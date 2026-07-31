'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'

import { SIDEBAR_ICON_MAP } from '../../config/module-icons.constants'
import { groupModules } from '../../lib/navigation'

import type { SidebarModule } from '@repo/shared-types'

interface SidebarPreviewProps {
  readonly modules: ReadonlyArray<SidebarModule>
  readonly highlightKey?: string | null
}

export function SidebarPreview({ modules, highlightKey }: Readonly<SidebarPreviewProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.navigation'
  const enabledModules = modules.filter((m) => m.enabled)
  const groups = groupModules(enabledModules)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{t(`${s}.previewTitle`)}</span>
        <span className="text-xs text-muted-foreground">
          {t(`${s}.modulesActive`, { count: enabledModules.length })}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        <div className="flex h-8 items-center justify-between border-b border-border bg-muted/40 px-3">
          <div className="flex gap-1.5">
            <div className="size-2 rounded-full bg-red-400/90" />
            <div className="size-2 rounded-full bg-amber-400/90" />
            <div className="size-2 rounded-full bg-emerald-400/90" />
          </div>
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground/50">
            app.nexo.com
          </span>
        </div>

        <div className="flex min-h-72 bg-background">
          <div className="flex w-44 shrink-0 flex-col gap-0.5 border-r border-border bg-muted/30 p-2.5">
            <div className="mb-3 flex items-center gap-2 px-2">
              <div className="size-5 rounded bg-primary" />
              <span className="text-xs font-bold text-foreground">Nexo CRM</span>
            </div>

            {groups.map((group, gi) => (
              <div key={group.key} className={cn(gi > 0 && 'mt-2')}>
                <p className="mb-1 px-2 text-[10px] font-semibold tracking-wide text-muted-foreground/60">
                  {t(`nav.groups.${group.key}`)}
                </p>
                {group.modules.map((mod) => {
                  const Icon = SIDEBAR_ICON_MAP[mod.icon]
                  const isActive = mod.key === 'dashboard'
                  const isHighlighted = mod.key === highlightKey
                  return (
                    <div
                      key={mod.key}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-colors',
                        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                        isHighlighted && !isActive && 'bg-accent text-accent-foreground',
                        isHighlighted && 'ring-1 ring-primary/50',
                      )}
                    >
                      {Icon ? <Icon className="size-3.5" /> : null}
                      <span className={isActive ? 'font-medium' : ''}>
                        {t(`nav.${mod.key}`, { defaultValue: mod.label })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="h-2.5 w-28 rounded-full bg-foreground/15" />
            <div className="h-2 w-full rounded-full bg-muted-foreground/8" />
            <div className="h-2 w-3/4 rounded-full bg-muted-foreground/8" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-16 rounded-lg border border-border bg-card" />
              <div className="h-16 rounded-lg border border-border bg-card" />
              <div className="h-16 rounded-lg border border-border bg-card" />
            </div>
            <div className="mt-1 flex-1 rounded-lg border border-border bg-card" />
          </div>
        </div>
      </div>
    </div>
  )
}
