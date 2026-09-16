'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { CloudSlashIcon } from '@/shared/ui/icons'
import { EmptyState } from '@/shared/ui/organisms/empty-state'
import { PageState } from '@/shared/ui/organisms/page-state'

interface ErrorPageProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function ErrorPage({ reset }: Readonly<ErrorPageProps>) {
  const { t } = useTranslation()

  return (
    <PageState>
      <EmptyState
        icon={<CloudSlashIcon className="size-5" />}
        title={t('errors.serverTitle')}
        description={t('errors.serverDescription')}
      >
        <PillButton size="md" onClick={reset}>
          {t('errors.retry')}
        </PillButton>
      </EmptyState>
    </PageState>
  )
}
