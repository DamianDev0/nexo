import { SECTOR_OPTIONS } from '@repo/shared-utils'
import { Clock3, Landmark, Lock } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { OptionTile } from '@/shared/ui/molecules/option-tile'
import { Input } from '@/shared/ui/shadcn/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/shadcn/input-group'
import { Label } from '@/shared/ui/shadcn/label'

import {
  COLOMBIA_FLAG_SRC,
  PHONE_PREFIX,
  REGIONAL_DEFAULTS,
  SECTOR_ICON_SRC,
} from '../model/company.constants'

import { WizardStep, type WizardStepNav } from './WizardStep'

import type { IndustrySector } from '@repo/shared-types'
import type { LucideIcon } from 'lucide-react'

interface CompanyData {
  readonly phone: string
  readonly website: string
  readonly sector: IndustrySector
}

interface CompanyActions {
  readonly onPhoneChange: (v: string) => void
  readonly onWebsiteChange: (v: string) => void
  readonly onSectorChange: (v: IndustrySector) => void
}

interface StepCompanyProps {
  readonly data: CompanyData
  readonly actions: CompanyActions
  readonly nav: WizardStepNav
}

interface ReadonlyFieldProps {
  readonly label: string
  readonly value: string
  readonly icon: LucideIcon
}

function ReadonlyField({ label, value, icon: Icon }: Readonly<ReadonlyFieldProps>) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5 flex h-9 items-center gap-2.5 rounded-md border border-border/70 bg-muted/40 px-3">
        <Icon className="size-4 shrink-0 text-muted-foreground/70" />
        <span className="flex-1 truncate text-sm text-foreground/80">{value}</span>
        <Lock className="size-3 shrink-0 text-muted-foreground/50" />
      </div>
    </div>
  )
}

export function StepCompany({ data, actions, nav }: Readonly<StepCompanyProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.company'

  return (
    <WizardStep
      header={{ badge: t(`${s}.badge`), title: t(`${s}.title`), description: t(`${s}.subtitle`) }}
      nav={{ ...nav, footerNote: t(`${s}.requiredFields`) }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.phone`)}</Label>
          <InputGroup className="mt-1.5 bg-transparent">
            <InputGroupAddon className="gap-2 border-r border-border/70 pr-2.5">
              <Image
                src={COLOMBIA_FLAG_SRC}
                alt="Colombia"
                width={16}
                height={16}
                className="size-4 rounded-full"
              />
              <span className="text-xs font-semibold text-foreground/70">{PHONE_PREFIX}</span>
            </InputGroupAddon>
            <InputGroupInput
              className="text-sm"
              placeholder="601 234 5678"
              inputMode="tel"
              value={data.phone}
              onChange={(e) => actions.onPhoneChange(e.target.value)}
            />
          </InputGroup>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.website`)}</Label>
          <Input
            className="mt-1.5 h-9 text-sm"
            placeholder="https://yourcompany.com"
            value={data.website}
            onChange={(e) => actions.onWebsiteChange(e.target.value)}
          />
        </div>
        <ReadonlyField
          label={t(`${s}.timezone`)}
          value={REGIONAL_DEFAULTS.timezoneDisplay}
          icon={Clock3}
        />
        <ReadonlyField
          label={t(`${s}.currency`)}
          value={REGIONAL_DEFAULTS.currencyDisplay}
          icon={Landmark}
        />
      </div>

      <div className="mt-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.sector`)}</Label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {SECTOR_OPTIONS.map((opt) => (
            <OptionTile
              key={opt.id}
              selected={data.sector === opt.id}
              onSelect={() => actions.onSectorChange(opt.id)}
              className="flex flex-col items-center p-3 text-center"
            >
              <Image
                src={SECTOR_ICON_SRC[opt.id]}
                alt=""
                width={36}
                height={36}
                className="size-9 drop-shadow-sm"
              />
              <div className="mt-1.5 text-xs font-semibold">{opt.label}</div>
            </OptionTile>
          ))}
        </div>
      </div>
    </WizardStep>
  )
}
