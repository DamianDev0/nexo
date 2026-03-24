import { useTranslation } from 'react-i18next'
import { Paintbrush } from 'lucide-react'
import { BRAND_COLOR_OPTIONS, THEME_MODE_OPTIONS } from '@repo/shared-utils'
import type { ThemeTypography, ThemeColors, SidebarModule, TenantTheme } from '@repo/shared-types'

import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { FileUpload } from '@/components/molecules/file-upload'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/molecules/popover'
import { ArcColorPicker } from '@/components/molecules/color-picker'
import { cn } from '@/utils'

import {
  COLOR_NAMES,
  GOOGLE_FONT_MAP,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  DENSITY_OPTIONS,
} from '../constants/appearance.constants'
import { useGoogleFont } from '../hooks/useGoogleFont'
import { AppearanceLivePreview } from './AppearanceLivePreview'
// import { ThemeHistoryPanel } from './ThemeHistoryPanel'
import { WizardStep } from './WizardStep'

interface StepAppearanceProps {
  readonly primaryColor: string
  readonly colors: ThemeColors
  readonly grainIntensity: number
  readonly darkMode: 'light' | 'dark' | 'system'
  readonly fontFamily: ThemeTypography['fontFamily']
  readonly borderRadius: ThemeTypography['borderRadius']
  readonly density: ThemeTypography['density']
  readonly productName: string
  readonly tagline: string
  readonly logoPreview: string | null
  readonly navModules: ReadonlyArray<SidebarModule>
  readonly logoFileName: string | null
  readonly isPending: boolean
  readonly onPrimaryColorChange: (v: string) => void
  readonly onColorOverride: (
    key: 'accent' | 'secondary' | 'sidebar' | 'sidebarForeground',
    v: string,
  ) => void
  readonly onGrainIntensityChange: (v: number) => void
  readonly onDarkModeChange: (v: 'light' | 'dark' | 'system') => void
  readonly onFontFamilyChange: (v: ThemeTypography['fontFamily']) => void
  readonly onBorderRadiusChange: (v: ThemeTypography['borderRadius']) => void
  readonly onDensityChange: (v: ThemeTypography['density']) => void
  readonly onProductNameChange: (v: string) => void
  readonly onTaglineChange: (v: string) => void
  readonly onLogoUpload: (file: File) => Promise<unknown>
  readonly onLogoRemove: () => void
  readonly onRestoreTheme: (config: Partial<TenantTheme>) => void
  readonly onNext: () => void
  readonly onBack: () => void
}

export function StepAppearance({
  primaryColor,
  colors,
  grainIntensity,
  darkMode,
  fontFamily,
  borderRadius,
  density,
  productName,
  tagline,
  navModules,
  logoPreview,
  logoFileName,
  isPending,
  onPrimaryColorChange,
  onColorOverride,
  onGrainIntensityChange,
  onDarkModeChange,
  onFontFamilyChange,
  onBorderRadiusChange,
  onDensityChange,
  onProductNameChange,
  onTaglineChange,
  onLogoUpload,
  onLogoRemove,
  // onRestoreTheme,
  onNext,
  onBack,
}: StepAppearanceProps) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.appearance'

  useGoogleFont(fontFamily)

  const colorName = COLOR_NAMES[primaryColor.toUpperCase()] ?? 'Custom'

  const preview = (
    <AppearanceLivePreview
      colors={colors}
      darkMode={darkMode}
      fontFamily={fontFamily}
      borderRadius={borderRadius}
      density={density}
      productName={productName}
      logoPreview={logoPreview}
      navModules={navModules}
    />
  )

  return (
    <WizardStep
      badge={t(`${s}.badge`)}
      title={t(`${s}.title`)}
      description={t(`${s}.subtitle`)}
      aside={preview}
      onBack={onBack}
      onNext={onNext}
      isPending={isPending}
      footerNote={t(`${s}.optionalNote`)}
    >
      {/* Logo */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.logo`, 'Logo')}</Label>
        <FileUpload
          preview={logoPreview}
          fileName={logoFileName}
          onUpload={onLogoUpload}
          onRemove={onLogoRemove}
        />
      </div>

      {/* Primary color */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.primaryColor`)}</Label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {BRAND_COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onPrimaryColorChange(color)}
              className={cn(
                'size-7 rounded-full border-2 transition-transform duration-150',
                primaryColor === color
                  ? 'scale-110 border-foreground'
                  : 'border-transparent hover:scale-105',
              )}
              style={{ background: color }}
              aria-label={`Select ${COLOR_NAMES[color] ?? color}`}
              aria-pressed={primaryColor === color}
            />
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-full border-2 border-border transition-transform duration-150 hover:scale-105 hover:border-foreground/50"
                aria-label="Pick custom color"
              >
                <Paintbrush className="size-3 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-0">
              <ArcColorPicker
                selectedColor={primaryColor}
                onColorChange={onPrimaryColorChange}
                grainIntensity={grainIntensity}
                onGrainIntensityChange={onGrainIntensityChange}
                className="w-full border-0 shadow-none"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="size-3 rounded-sm" style={{ background: primaryColor }} />
          <span className="text-xs text-muted-foreground">
            {colorName} · <span className="font-mono text-xs">{primaryColor}</span>
          </span>
        </div>
      </div>

      {/* Theme colors */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">
          {t(`${s}.secondaryColors`, 'Theme colors')}
        </Label>
        <div className="mt-2 flex flex-wrap gap-3">
          {(
            [
              { key: 'accent' as const, label: 'Accent' },
              { key: 'sidebar' as const, label: 'Sidebar' },
              { key: 'secondary' as const, label: 'Background' },
              { key: 'sidebarForeground' as const, label: 'Text' },
            ] as const
          ).map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="size-7 rounded-full border-2 border-border transition-transform duration-150 hover:scale-105"
                    style={{ background: colors[item.key] }}
                    aria-label={`Change ${item.label} color`}
                  />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-0">
                  <ArcColorPicker
                    selectedColor={colors[item.key]}
                    onColorChange={(v) => onColorOverride(item.key, v)}
                    grainIntensity={0}
                    onGrainIntensityChange={() => undefined}
                    className="w-full border-0 shadow-none"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Font */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.font`, 'Font')}</Label>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {FONT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFontFamilyChange(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-colors',
                fontFamily === opt.value
                  ? 'border-primary bg-accent text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
              )}
              style={{
                fontFamily:
                  opt.value === 'system'
                    ? 'system-ui'
                    : `'${GOOGLE_FONT_MAP[opt.value]}', system-ui`,
              }}
            >
              <span className="text-lg font-semibold leading-none">{opt.sample}</span>
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Corners */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.corners`, 'Corners')}</Label>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onBorderRadiusChange(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-colors',
                borderRadius === opt.value
                  ? 'border-primary bg-accent text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
              )}
            >
              <div className={cn('size-4 border-2 border-current', opt.preview)} />
              <span className="text-xs leading-none">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.density`, 'Density')}</Label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {DENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onDensityChange(opt.value)}
              className={cn(
                'rounded-lg border px-2 py-2 text-center text-xs transition-colors',
                density === opt.value
                  ? 'border-primary bg-accent text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color mode */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.colorMode`)}</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {THEME_MODE_OPTIONS.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onDarkModeChange(mode)}
              className={cn(
                'rounded-lg border p-2.5 text-center text-xs font-semibold capitalize transition-colors',
                darkMode === mode
                  ? 'border-primary bg-accent text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* CRM name & tagline */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.crmName`)}</Label>
          <Input
            className="mt-1.5 h-9 border-border text-sm"
            placeholder="Nexo Acme Corp"
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.loginTagline`)}</Label>
          <Input
            className="mt-1.5 h-9 border-border text-sm"
            placeholder="Build. Grow. Scale."
            value={tagline}
            onChange={(e) => onTaglineChange(e.target.value)}
          />
        </div>
      </div>

      {/* Theme history */}
      {/* <ThemeHistoryPanel onRestore={onRestoreTheme} /> */}
    </WizardStep>
  )
}
