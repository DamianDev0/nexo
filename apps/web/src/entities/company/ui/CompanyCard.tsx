'use client'

import { useTranslation } from 'react-i18next'

import { Amount } from '@/shared/ui/atoms/amount'
import { IconFrame } from '@/shared/ui/atoms/icon-frame'
import { Text } from '@/shared/ui/atoms/text'
import { BuildingsIcon } from '@/shared/ui/icons'

import { companyMetaLine } from '../lib/company-display'

import type { CompanySummary } from '@repo/shared-types'

type CompanyCardProps = {
  readonly company: CompanySummary
  readonly action?: React.ReactNode
}

export function CompanyCard({ company, action }: Readonly<CompanyCardProps>) {
  const { t } = useTranslation()
  const meta = companyMetaLine(company)

  return (
    <div data-slot="company-card" className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <IconFrame>
          <BuildingsIcon />
        </IconFrame>
        <span className="flex min-w-0 flex-1 flex-col">
          <Text variant="strong" className="truncate">
            {company.name}
          </Text>
          {meta ? (
            <Text variant="hint" className="truncate">
              {meta}
            </Text>
          ) : null}
        </span>
        {action}
      </div>

      <dl className="grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="dt" variant="caption">
            {t('companies.stats.contacts')}
          </Text>
          <Text as="dd" variant="strong" className="tabular-nums">
            {company.stats.contactCount}
          </Text>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="dt" variant="caption">
            {t('companies.stats.openDeals')}
          </Text>
          <Text as="dd" variant="strong" className="tabular-nums">
            {company.stats.activeDealCount}
          </Text>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="dt" variant="caption">
            {t('companies.stats.pipeline')}
          </Text>
          <Amount cents={company.stats.totalDealsValueCents} className="font-bold" />
        </div>
      </dl>
    </div>
  )
}
