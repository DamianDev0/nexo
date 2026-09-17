'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { useObjectDescriptor } from '@/entities/object-descriptor'
import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { WarningCircleIcon } from '@/shared/ui/icons'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { resolveEmptyKind } from '../lib/empty-kind'
import { resolveTablePhase } from '../lib/table-phase'

import { RecordsPagination } from './RecordsPagination'

import type { RecordsBoardActions, RecordsBoardState } from '../model/types/records-board.types'
import type { EntityTerms } from '@/entities/nomenclature'
import type { RefObject } from 'react'

type RecordsTableStatesProps = {
  readonly state: RecordsBoardState
  readonly actions: RecordsBoardActions
  readonly terms: EntityTerms
  readonly scrollRef: RefObject<HTMLDivElement | null>
}

export function RecordsTableStates({
  state,
  actions,
  terms,
  scrollRef,
}: Readonly<RecordsTableStatesProps>) {
  const { t } = useTranslation()
  const { icon: RecordIcon } = useObjectDescriptor()
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
            icon={<RecordIcon className="size-5" />}
            title={t('records.unavailable.title')}
            description={t('records.unavailable.description')}
          />
        )}

        {phase === 'failed' && (
          <EmptyState
            fill
            icon={<WarningCircleIcon className="size-5" />}
            title={t('records.loadFailed.title', { entities: terms.lowerPlural })}
            description={t('records.loadFailed.description')}
          >
            <PillButton size="md" variant="tertiary" onClick={() => void actions.onRetry()}>
              {t('records.loadFailed.retry')}
            </PillButton>
          </EmptyState>
        )}

        {phase === 'empty' && (
          <EmptyState
            fill
            icon={<RecordIcon className="size-5" />}
            title={t(`records.${emptyKind}.title`, { entities: terms.lowerPlural })}
            description={t(`records.${emptyKind}.description`, {
              entity: terms.lowerSingular,
              entities: terms.lowerPlural,
            })}
          >
            {emptyKind === 'empty' && (
              <PillButton size="md" onClick={actions.onCreate}>
                {t('records.empty.cta', { entity: terms.lowerSingular })}
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
            <RecordsPagination
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
