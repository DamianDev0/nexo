import { DENSITY_MAP, GOOGLE_FONT_MAP, RADIUS_MAP } from '../../model/appearance.constants'
import { deriveDarkPalette } from '../../model/palette.utils'

import { PreviewMain } from './PreviewMain'
import { PreviewSidebar } from './PreviewSidebar'

import type { ThemeMode } from '../../model/appearance.types'
import type { SidebarModule, ThemeColors, ThemeTypography } from '@repo/shared-types'

export interface LivePreviewData {
  readonly colors: ThemeColors
  readonly darkMode: ThemeMode
  readonly fontFamily: ThemeTypography['fontFamily']
  readonly borderRadius: ThemeTypography['borderRadius']
  readonly density: ThemeTypography['density']
  readonly productName: string
  readonly logoPreview: string | null
  readonly navModules: ReadonlyArray<SidebarModule>
}

interface AppearanceLivePreviewProps {
  readonly data: LivePreviewData
}

export function AppearanceLivePreview({ data }: Readonly<AppearanceLivePreviewProps>) {
  const isDark = data.darkMode === 'dark'
  const colors = isDark ? deriveDarkPalette(data.colors) : data.colors

  const fontFace = GOOGLE_FONT_MAP[data.fontFamily]
  const r = RADIUS_MAP[data.borderRadius]
  const d = DENSITY_MAP[data.density]

  const enabledModules = data.navModules.filter((m) => m.enabled)

  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Live preview</span>
        <span className="text-xs text-muted-foreground">Updates in real time</span>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-border shadow-sm"
        style={{ fontFamily: `'${fontFace}', system-ui, sans-serif` }}
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2">
          <div className="flex gap-1.5">
            <div className="size-2 rounded-full bg-red-400/80" />
            <div className="size-2 rounded-full bg-amber-400/80" />
            <div className="size-2 rounded-full bg-emerald-400/80" />
          </div>
          <div className="ml-3 flex-1 rounded bg-background/60 px-2 py-0.5 text-center text-xs text-muted-foreground/60">
            app.nexo.com
          </div>
        </div>

        <div className="flex min-h-80">
          <PreviewSidebar
            colors={colors}
            radius={r}
            density={d}
            productName={data.productName}
            logoPreview={data.logoPreview}
            modules={enabledModules}
          />
          <PreviewMain colors={colors} radius={r} gap={d.gap} />
        </div>
      </div>
    </div>
  )
}
