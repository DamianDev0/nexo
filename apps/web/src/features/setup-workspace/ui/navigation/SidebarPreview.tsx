import { cn } from '@/shared/lib'

import { SIDEBAR_ICON_MAP } from '../../model/icon-map.constants'

import type { SidebarModule } from '@repo/shared-types'

interface SidebarPreviewProps {
  readonly modules: ReadonlyArray<SidebarModule>
}

export function SidebarPreview({ modules }: SidebarPreviewProps) {
  const enabledModules = modules.filter((m) => m.enabled)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Sidebar preview</span>
        <span className="text-xs text-muted-foreground">
          {enabledModules.length} modules active
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-400/80" />
            <div className="size-2.5 rounded-full bg-amber-400/80" />
            <div className="size-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="ml-4 flex-1 rounded-md bg-background/60 px-3 py-1 text-center text-xs text-muted-foreground">
            app.nexo.com
          </div>
        </div>

        <div className="flex min-h-72 bg-background">
          <div className="flex w-44 shrink-0 flex-col gap-0.5 border-r border-border bg-muted/30 p-2.5">
            <div className="mb-3 flex items-center gap-2 px-2">
              <div className="size-5 rounded bg-primary" />
              <span className="text-xs font-bold text-foreground">Nexo CRM</span>
            </div>

            {enabledModules.map((mod, i) => {
              const Icon = SIDEBAR_ICON_MAP[mod.icon]
              const isActive = i === 0
              return (
                <div
                  key={mod.key}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                >
                  {Icon ? <Icon className="size-3.5" /> : null}
                  <span className={isActive ? 'font-medium' : ''}>{mod.label}</span>
                </div>
              )
            })}
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
