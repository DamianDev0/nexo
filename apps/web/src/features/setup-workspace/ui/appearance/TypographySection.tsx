import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { OptionTile } from '@/shared/ui/molecules/option-tile'
import { Label } from '@/shared/ui/shadcn/label'

import {
  DENSITY_OPTIONS,
  FONT_OPTIONS,
  GOOGLE_FONT_MAP,
  RADIUS_OPTIONS,
} from '../../model/appearance.constants'

import type { ThemeTypography } from '@repo/shared-types'

interface TypographyData {
  readonly fontFamily: ThemeTypography['fontFamily']
  readonly borderRadius: ThemeTypography['borderRadius']
  readonly density: ThemeTypography['density']
}

interface TypographyActions {
  readonly onFontFamilyChange: (v: ThemeTypography['fontFamily']) => void
  readonly onBorderRadiusChange: (v: ThemeTypography['borderRadius']) => void
  readonly onDensityChange: (v: ThemeTypography['density']) => void
}

interface TypographySectionProps {
  readonly data: TypographyData
  readonly actions: TypographyActions
}

export function TypographySection({ data, actions }: Readonly<TypographySectionProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.appearance'

  return (
    <>
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.font`, 'Font')}</Label>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {FONT_OPTIONS.map((opt) => (
            <OptionTile
              key={opt.value}
              selected={data.fontFamily === opt.value}
              onSelect={() => actions.onFontFamilyChange(opt.value)}
              className="flex flex-col items-center gap-1 px-1 py-2"
            >
              <span
                className="text-lg font-semibold leading-none"
                style={{
                  fontFamily:
                    opt.value === 'system'
                      ? 'system-ui'
                      : `'${GOOGLE_FONT_MAP[opt.value]}', system-ui`,
                }}
              >
                {opt.sample}
              </span>
              <span className="text-xs">{opt.label}</span>
            </OptionTile>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.corners`, 'Corners')}</Label>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {RADIUS_OPTIONS.map((opt) => (
            <OptionTile
              key={opt.value}
              selected={data.borderRadius === opt.value}
              onSelect={() => actions.onBorderRadiusChange(opt.value)}
              className="flex flex-col items-center gap-1 px-1 py-2"
            >
              <div className={cn('size-4 border-2 border-current', opt.preview)} />
              <span className="text-xs leading-none">{opt.label}</span>
            </OptionTile>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.density`, 'Density')}</Label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {DENSITY_OPTIONS.map((opt) => (
            <OptionTile
              key={opt.value}
              selected={data.density === opt.value}
              onSelect={() => actions.onDensityChange(opt.value)}
              className="px-2 py-2 text-center text-xs"
            >
              {opt.label}
            </OptionTile>
          ))}
        </div>
      </div>
    </>
  )
}
