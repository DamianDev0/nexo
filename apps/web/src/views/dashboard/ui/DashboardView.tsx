import { Check, Inbox } from 'lucide-react'

import { getT } from '@/shared/i18n/server'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { getDashboard } from '../api/get-dashboard'
import { DASHBOARD_TIP_KEYS } from '../model/dashboard.constants'

export async function DashboardView() {
  const [t, { user }] = await Promise.all([getT(), getDashboard()])
  const firstName = user.email.split('@')[0]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-9 py-8">
      <header>
        <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.045em] text-foreground">
          {t('dashboard.greeting')}, {firstName}.
        </h1>
        <p className="mt-3 text-lg text-body">{t('dashboard.subtitle')}</p>
      </header>

      <EmptyState
        icon={<Inbox className="size-5" />}
        title={t('dashboard.emptyTitle')}
        description={t('dashboard.emptyDescription')}
      >
        <div className="flex gap-2.5">
          <PillButton size="md">{t('dashboard.newDeal')}</PillButton>
          <PillButton size="md" variant="tertiary">
            {t('dashboard.importCsv')}
          </PillButton>
        </div>

        <ul className="flex w-full max-w-sm flex-col gap-4 text-left">
          {DASHBOARD_TIP_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <Check className="size-3" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {t(`dashboard.tips.${key}Title`)}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {t(`dashboard.tips.${key}Body`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </EmptyState>
    </div>
  )
}
