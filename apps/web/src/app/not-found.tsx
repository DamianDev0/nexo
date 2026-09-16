import Link from 'next/link'

import { ROUTES } from '@/shared/config/routes'
import { getT } from '@/shared/i18n/server'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { SignpostIcon } from '@/shared/ui/icons'
import { EmptyState } from '@/shared/ui/organisms/empty-state'
import { PageState } from '@/shared/ui/organisms/page-state'

export default async function NotFoundPage() {
  const t = await getT()

  return (
    <PageState>
      <EmptyState
        icon={<SignpostIcon className="size-5" />}
        title={t('errors.notFoundTitle')}
        description={t('errors.notFoundDescription')}
      >
        <PillButton asChild size="md">
          <Link href={ROUTES.app.dashboard}>{t('errors.notFoundCta')}</Link>
        </PillButton>
      </EmptyState>
    </PageState>
  )
}
