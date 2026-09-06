'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { BulkHistoryTable } from '@/features/bulk-actions'
import { ROUTES } from '@/shared/config/routes'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CaretLeftIcon } from '@/shared/ui/icons'

export function BulkActionsView() {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 px-6 pb-4 pt-8">
        <PillButton asChild variant="ghost" size="xs" className="w-8 px-0">
          <Link
            href={ROUTES.app.contacts.list}
            aria-label={t('bulkActions.backToContacts', { entities: terms.lowerPlural })}
          >
            <CaretLeftIcon className="size-4" />
          </Link>
        </PillButton>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {t('bulkActions.title')}
          </h1>
          <Text as="p" variant="muted">
            {t('bulkActions.subtitle')}
          </Text>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        <BulkHistoryTable />
      </div>
    </div>
  )
}
