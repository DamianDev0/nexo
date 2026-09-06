'use client'

import { useTranslation } from 'react-i18next'

import { contactFullName } from '@/entities/contact'
import { useEntityTerms } from '@/entities/nomenclature'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { UsersThreeIcon } from '@/shared/ui/icons'
import { MorphingPageDots } from '@/shared/ui/molecules/morphing-page-dots'
import { PagedTransition } from '@/shared/ui/molecules/paged-transition'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { useArchivedContacts } from '../../../model/useArchivedContacts'

import { TrashRow } from './TrashRow'

export function ArchivedContactsList() {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const list = useArchivedContacts()
  const restoreLabel = t('settings.trash.restore')

  if (!list.isPending && list.total === 0) {
    return (
      <EmptyState
        icon={<UsersThreeIcon className="size-6" />}
        title={t('settings.trash.emptyContactsTitle', { entities: terms.lowerPlural })}
        description={t('settings.trash.emptyContactsDescription', { entities: terms.lowerPlural })}
      />
    )
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <PillButton
          variant="outline"
          size="xs"
          disabled={list.isRestoringAll || list.total === 0}
          onClick={list.restoreAll}
        >
          {t('settings.trash.restoreAll', { count: list.total })}
        </PillButton>
      </div>
      <PagedTransition page={list.pagination.page} className="flex flex-col gap-1.5">
        {list.contacts.map((contact) => (
          <TrashRow
            key={contact.id}
            title={contactFullName(contact)}
            subtitle={contact.email ?? contact.phone ?? undefined}
            restore={{ label: restoreLabel, onClick: () => list.restoreOne(contact) }}
          />
        ))}
      </PagedTransition>
      <MorphingPageDots
        total={list.pagination.totalPages}
        page={list.pagination.page}
        onPageChange={list.pagination.onPageChange}
        label={t('settings.pagination.page')}
        className="mt-3"
      />
    </>
  )
}
