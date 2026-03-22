import { TIMEZONE_OPTIONS, CURRENCY_OPTIONS, SECTOR_OPTIONS } from '@repo/shared-utils'

import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { cn } from '@/utils'
import { WizardStep } from './WizardStep'

interface StepCompanyProps {
  readonly phone: string
  readonly website: string
  readonly timezone: string
  readonly currency: string
  readonly sector: string
  readonly isPending: boolean
  readonly onPhoneChange: (v: string) => void
  readonly onWebsiteChange: (v: string) => void
  readonly onTimezoneChange: (v: string) => void
  readonly onCurrencyChange: (v: string) => void
  readonly onSectorChange: (v: string) => void
  readonly onNext: () => void
}

export function StepCompany({
  phone,
  website,
  timezone,
  currency,
  sector,
  isPending,
  onPhoneChange,
  onWebsiteChange,
  onTimezoneChange,
  onCurrencyChange,
  onSectorChange,
  onNext,
}: StepCompanyProps) {
  return (
    <WizardStep
      badge="Step 1 of 6"
      title="Tell us about your company"
      description="This information personalizes your CRM and sets regional defaults."
      onNext={onNext}
      isPending={isPending}
      footerNote="Fields with * are required"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Phone</Label>
          <Input
            className="mt-1.5 h-9 border-border text-sm"
            placeholder="601 234 5678"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Website</Label>
          <Input
            className="mt-1.5 h-9 border-border text-sm"
            placeholder="https://yourcompany.com"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Timezone</Label>
          <select
            className="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Currency</Label>
          <select
            className="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-xs text-muted-foreground">Industry sector</Label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {SECTOR_OPTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSectorChange(s.id)}
              className={cn(
                'rounded-lg border p-3 text-center transition-colors',
                sector === s.id
                  ? 'border-primary bg-accent'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <div className="text-xl">{s.icon}</div>
              <div className="mt-1 text-xs font-semibold">{s.label}</div>
            </button>
          ))}
        </div>
      </div>
    </WizardStep>
  )
}
