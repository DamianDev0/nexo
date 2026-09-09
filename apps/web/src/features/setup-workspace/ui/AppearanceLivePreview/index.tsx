import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { BrowserFrame } from '@/shared/ui/molecules/browser-frame'

import {
  DENSITY_MAP,
  GOOGLE_FONT_MAP,
  RADIUS_MAP,
  SURFACE_RADIUS_MAP,
} from '../../config/appearance.constants'
import { deriveDarkPalette } from '../../lib/palette'

import { PreviewMain } from './PreviewMain'
import { PreviewSidebar } from './PreviewSidebar'

import type { ThemeMode } from '../../model/types'
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
  const { t } = useTranslation()
  const isDark = data.darkMode === 'dark'
  const colors = isDark ? deriveDarkPalette(data.colors) : data.colors

  const fontFace = GOOGLE_FONT_MAP[data.fontFamily]
  const r = RADIUS_MAP[data.borderRadius]
  const d = DENSITY_MAP[data.density]

  const enabledModules = data.navModules.filter((m) => m.enabled)

  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <div className="flex items-center justify-between">
        <Text variant="emphasis">{t('onboarding.steps.appearance.livePreview')}</Text>
        <Text variant="hint">{t('onboarding.steps.appearance.updatesRealTime')}</Text>
      </div>

      <BrowserFrame
        address="app.nexo.com"
        style={{ fontFamily: `'${fontFace}', system-ui, sans-serif` }}
      >
        <div className="flex min-h-96">
          <PreviewSidebar
            colors={colors}
            radius={r}
            density={d}
            productName={data.productName}
            logoPreview={data.logoPreview}
            modules={enabledModules}
          />
          <PreviewMain
            colors={colors}
            radius={r}
            surfaceRadius={SURFACE_RADIUS_MAP[data.borderRadius]}
            gap={d.gap}
          />
        </div>
      </BrowserFrame>
    </div>
  )
}
