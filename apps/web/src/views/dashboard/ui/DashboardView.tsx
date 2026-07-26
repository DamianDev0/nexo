import { Inbox } from 'lucide-react'

import { getT } from '@/shared/i18n/server'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { getDashboard } from '../api/get-dashboard'

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
        <PillButton size="md">{t('dashboard.newDeal')}</PillButton>
        <PillButton size="md" variant="tertiary">
          {t('dashboard.importCsv')}
        </PillButton>
      </EmptyState>
    </div>
  )
}
