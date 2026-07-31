'use client'

import { useTranslation } from 'react-i18next'

import { Label } from '@/shared/ui/shadcn/label'

import { ColorField } from './ColorField'

import type { OverridableColorKey } from '../../model/types'
import type { ThemeColors } from '@repo/shared-types'

const OVERRIDE_ITEMS: ReadonlyArray<{ key: OverridableColorKey; labelKey: string }> = [
  { key: 'accent', labelKey: 'accent' },
  { key: 'sidebar', labelKey: 'sidebar' },
  { key: 'secondary', labelKey: 'background' },
  { key: 'sidebarForeground', labelKey: 'text' },
]

interface ThemeColorsSectionProps {
  readonly colors: ThemeColors
  readonly onColorOverride: (key: OverridableColorKey, v: string) => void
}

export function ThemeColorsSection({ colors, onColorOverride }: Readonly<ThemeColorsSectionProps>) {
  const { t } = useTranslation()

  return (
    <div className="px-4 py-4">
      <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">
        {t('onboarding.steps.appearance.secondaryColors', 'Theme colors')}
      </Label>
      <div className="mt-2.5 flex flex-col gap-2">
        {OVERRIDE_ITEMS.map((item) => (
          <ColorField
            key={item.key}
            label={t(`onboarding.steps.appearance.colors.${item.labelKey}`)}
            color={colors[item.key]}
            onChange={(v) => onColorOverride(item.key, v)}
          />
        ))}
      </div>
    </div>
  )
}
