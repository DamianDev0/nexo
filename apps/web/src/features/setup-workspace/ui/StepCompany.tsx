import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { COLOMBIA_FLAG_SRC, PHONE_PREFIX } from '@/shared/config/colombia'
import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { Text } from '@/shared/ui/atoms/text'
import { BankIcon, ClockIcon, LockIcon } from '@/shared/ui/icons'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/shadcn/input-group'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { REGIONAL_DEFAULTS } from '../config/company.constants'

import { SectorPicker } from './SectorPicker'
import { WizardStep, type WizardStepNav } from './WizardStep'

import type { AppIcon } from '@/shared/ui/icons'
import type { IndustrySector } from '@repo/shared-types'

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
  readonly icon: AppIcon
}

function ReadonlyField({ label, value, icon: Icon }: Readonly<ReadonlyFieldProps>) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-1.5 flex h-9 items-center gap-2.5 rounded-md border border-border/70 bg-muted/40 px-3">
        <Icon className="size-4 shrink-0 text-muted-foreground/70" />
        <Text variant="body" className="flex-1 truncate text-foreground/80">
          {value}
        </Text>
        <LockIcon className="size-3 shrink-0 text-muted-foreground/50" />
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
          <FieldLabel>{t(`${s}.phone`)}</FieldLabel>
          <InputGroup className="mt-1.5 bg-transparent">
            <InputGroupAddon className="gap-2 border-r border-border/70 pr-2.5">
              <Image
                src={COLOMBIA_FLAG_SRC}
                alt="Colombia"
                width={16}
                height={16}
                className="size-4 rounded-full"
              />
              <Text variant="emphasis" className="text-foreground/70">
                {PHONE_PREFIX}
              </Text>
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
          <FieldLabel>{t(`${s}.website`)}</FieldLabel>
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
          icon={ClockIcon}
        />
        <ReadonlyField
          label={t(`${s}.currency`)}
          value={REGIONAL_DEFAULTS.currencyDisplay}
          icon={BankIcon}
        />
      </div>

      <SectorPicker value={data.sector} onSelect={actions.onSectorChange} />
    </WizardStep>
  )
}
