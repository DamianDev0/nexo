'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { UsersThreeIcon } from '@/shared/ui/icons'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { resolveEmptyKind } from '../lib/empty-kind'
import { resolveTablePhase } from '../lib/table-phase'

import { ContactsPagination } from './ContactsPagination'

import type { ContactsBoard } from '../model/useContactsBoard'
import type { EntityTerms } from '@/entities/nomenclature'
import type { RefObject } from 'react'

type ContactsTableStatesProps = {
  readonly state: ContactsBoard['state']
  readonly actions: ContactsBoard['actions']
  readonly terms: EntityTerms
  readonly scrollRef: RefObject<HTMLDivElement | null>
}

export function ContactsTableStates({
  state,
  actions,
  terms,
  scrollRef,
}: Readonly<ContactsTableStatesProps>) {
  const { t } = useTranslation()
  const fade = useReducedTransition(quickEase)
  const phase = resolveTablePhase(state)
  const emptyKind = resolveEmptyKind(state)

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className="flex min-h-0 flex-1 flex-col"
      >
        {phase === 'pending' && <DataTable.Skeleton />}

        {phase === 'unavailable' && (
          <EmptyState
            fill
            icon={<UsersThreeIcon className="size-5" />}
            title={t('contacts.unavailable.title')}
            description={t('contacts.unavailable.description')}
          />
        )}

        {phase === 'empty' && (
          <EmptyState
            fill
            icon={<UsersThreeIcon className="size-5" />}
            title={t(`contacts.${emptyKind}.title`, { entities: terms.lowerPlural })}
            description={t(`contacts.${emptyKind}.description`, {
              entity: terms.lowerSingular,
              entities: terms.lowerPlural,
            })}
          >
            {emptyKind === 'empty' && (
              <PillButton size="md" onClick={actions.onCreate}>
                {t('contacts.empty.cta', { entity: terms.lowerSingular })}
              </PillButton>
            )}
          </EmptyState>
        )}

        {phase === 'rows' && (
          <>
            <DataTable.Scroller ref={scrollRef} hideScrollbar className="min-h-0 flex-1">
              <DataTable.Grid>
                <DataTable.Header />
                <DataTable.Body busy={state.isFetching} />
              </DataTable.Grid>
            </DataTable.Scroller>
            <ContactsPagination
              nav={{
                page: state.page,
                totalPages: state.totalPages,
                limit: state.limit,
                total: state.total,
              }}
              scrollTarget={scrollRef}
              onPageChange={actions.onPageChange}
              onPrefetchPage={actions.onPrefetchPage}
              onLimitChange={actions.onLimitChange}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
