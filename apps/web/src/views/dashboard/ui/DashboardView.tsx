import { getT } from '@/shared/i18n/server'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon, TrayIcon } from '@/shared/ui/icons'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { getDashboard } from '../api/get-dashboard'
import { DASHBOARD_TIP_KEYS } from '../config/dashboard.constants'

export async function DashboardView() {
  const [t, { user }] = await Promise.all([getT(), getDashboard()])
  const firstName = user.email.split('@')[0]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-9 py-8">
      <header>
        <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.045em] text-foreground">
          {t('dashboard.greeting')}, {firstName}.
        </h1>
        <Text as="p" variant="lead" className="mt-3">
          {t('dashboard.subtitle')}
        </Text>
      </header>

      <EmptyState
        icon={<TrayIcon className="size-5" />}
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
                <CheckIcon className="size-3" />
              </span>
              <div>
                <Text as="p" variant="strong" className="font-semibold leading-snug">
                  {t(`dashboard.tips.${key}Title`)}
                </Text>
                <Text as="p" variant="hint" className="mt-0.5 leading-relaxed">
                  {t(`dashboard.tips.${key}Body`)}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      </EmptyState>
    </div>
  )
}
