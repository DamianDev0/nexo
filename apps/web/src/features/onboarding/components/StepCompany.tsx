import { useTranslation } from 'react-i18next'
import { SECTOR_OPTIONS } from '@repo/shared-utils'

import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { cn } from '@/utils'
import { WizardStep } from './WizardStep'

interface StepCompanyProps {
  readonly phone: string
  readonly website: string
  readonly sector: string
  readonly isPending: boolean
  readonly onPhoneChange: (v: string) => void
  readonly onWebsiteChange: (v: string) => void
  readonly onSectorChange: (v: string) => void
  readonly onNext: () => void
}

export function StepCompany({
  phone,
  website,
  sector,
  isPending,
  onPhoneChange,
  onWebsiteChange,
  onSectorChange,
  onNext,
}: StepCompanyProps) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.company'

  return (
    <WizardStep
      badge={t(`${s}.badge`)}
      title={t(`${s}.title`)}
      description={t(`${s}.subtitle`)}
      onNext={onNext}
      isPending={isPending}
      footerNote={t(`${s}.requiredFields`)}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.phone`)}</Label>
          <Input
            className="mt-1.5 h-9 border-border text-sm"
            placeholder="601 234 5678"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.website`)}</Label>
          <Input
            className="mt-1.5 h-9 border-border text-sm"
            placeholder="https://yourcompany.com"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.timezone`)}</Label>
          <Input
            className="mt-1.5 h-9 border-border bg-muted text-sm text-muted-foreground"
            value="America/Bogota (UTC-5)"
            disabled
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.currency`)}</Label>
          <Input
            className="mt-1.5 h-9 border-border bg-muted text-sm text-muted-foreground"
            value="COP — Colombian Peso"
            disabled
          />
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.sector`)}</Label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {SECTOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSectorChange(opt.id)}
              className={cn(
                'rounded-lg border p-3 text-center transition-colors',
                sector === opt.id
                  ? 'border-primary bg-accent'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <div className="text-xl">{opt.icon}</div>
              <div className="mt-1 text-xs font-semibold">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
    </WizardStep>
  )
}
