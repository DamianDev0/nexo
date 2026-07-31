'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { SegmentedControl } from '@/shared/ui/molecules/segmented-control'
import { Label } from '@/shared/ui/shadcn/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'

import {
  DENSITY_OPTIONS,
  FONT_OPTIONS,
  GOOGLE_FONT_MAP,
  RADIUS_OPTIONS,
} from '../../config/appearance.constants'

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

function fontStack(value: ThemeTypography['fontFamily']): string {
  return value === 'system' ? 'system-ui' : `'${GOOGLE_FONT_MAP[value]}', system-ui`
}

export function TypographySection({ data, actions }: Readonly<TypographySectionProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.appearance'

  return (
    <>
      <div className="px-4 py-4">
        <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">
          {t(`${s}.font`, 'Font')}
        </Label>
        <Select value={data.fontFamily} onValueChange={actions.onFontFamilyChange}>
          <SelectTrigger
            className="mt-2 h-8 w-full text-sm"
            style={{ fontFamily: fontStack(data.fontFamily) }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-sm"
                style={{ fontFamily: fontStack(opt.value) }}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="px-4 py-4">
        <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">
          {t(`${s}.corners`, 'Corners')}
        </Label>
        <SegmentedControl
          className="mt-2"
          value={data.borderRadius}
          onValueChange={actions.onBorderRadiusChange}
          options={RADIUS_OPTIONS.map((opt) => ({
            value: opt.value,
            label: (
              <span className="flex flex-col items-center gap-1">
                <span className={cn('size-4 border-l-2 border-t-2 border-current', opt.preview)} />
                <span className="text-[10px] leading-none">
                  {t(`${s}.options.${opt.labelKey}`)}
                </span>
              </span>
            ),
          }))}
        />
      </div>

      <div className="px-4 py-4">
        <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">
          {t(`${s}.density`, 'Density')}
        </Label>
        <SegmentedControl
          className="mt-2"
          value={data.density}
          onValueChange={actions.onDensityChange}
          options={DENSITY_OPTIONS.map((opt) => ({
            value: opt.value,
            label: t(`${s}.options.${opt.labelKey}`),
          }))}
        />
      </div>
    </>
  )
}
