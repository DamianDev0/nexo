import { useTranslation } from 'react-i18next'
import { BRAND_COLOR_OPTIONS, THEME_MODE_OPTIONS } from '@repo/shared-utils'

import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { ColorPicker } from '@/components/molecules/color-picker'
import { cn } from '@/utils'
import { WizardStep } from './WizardStep'

interface StepAppearanceProps {
  readonly primaryColor: string
  readonly darkMode: 'light' | 'dark' | 'system'
  readonly productName: string
  readonly tagline: string
  readonly isPending: boolean
  readonly onPrimaryColorChange: (v: string) => void
  readonly onDarkModeChange: (v: 'light' | 'dark' | 'system') => void
  readonly onProductNameChange: (v: string) => void
  readonly onTaglineChange: (v: string) => void
  readonly onNext: () => void
  readonly onBack: () => void
}

export function StepAppearance({
  primaryColor,
  darkMode,
  productName,
  tagline,
  isPending,
  onPrimaryColorChange,
  onDarkModeChange,
  onProductNameChange,
  onTaglineChange,
  onNext,
  onBack,
}: StepAppearanceProps) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.appearance'

  return (
    <WizardStep
      badge={t(`${s}.badge`)}
      title={t(`${s}.title`)}
      description={t(`${s}.subtitle`)}
      onBack={onBack}
      onNext={onNext}
      isPending={isPending}
      footerNote={t(`${s}.optionalNote`)}
    >
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.primaryColor`)}</Label>
        <ColorPicker
          className="mt-2"
          colors={BRAND_COLOR_OPTIONS}
          selected={primaryColor}
          onChange={onPrimaryColorChange}
        />
      </div>

      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.colorMode`)}</Label>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {THEME_MODE_OPTIONS.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onDarkModeChange(mode)}
              className={cn(
                'rounded-lg border p-3 text-center text-xs font-semibold capitalize transition-colors',
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
    </WizardStep>
  )
}
