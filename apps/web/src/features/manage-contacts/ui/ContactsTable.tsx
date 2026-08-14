'use client'

import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { PlusIcon, UsersThreeIcon } from '@/shared/ui/icons'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { EmptyState } from '@/shared/ui/organisms/empty-state'

import { ContactsPagination } from './ContactsPagination'

import type { ContactsBoard } from '../model/useContactsBoard'

type ContactsTableProps = Readonly<Pick<ContactsBoard, 'instance' | 'lists' | 'state' | 'actions'>>

export function ContactsTable({ instance, lists, state, actions }: ContactsTableProps) {
  const { t } = useTranslation()
  const pageTransition = useReducedTransition(quickEase)

  return (
    <DataTable instance={instance} className="flex flex-1 flex-col rounded-none bg-transparent">
      <DataTable.SmartLists
        data={lists}
        onSelect={actions.onSelectList}
        onReorder={actions.onReorderLists}
        hotkeys
      >
        <PillButton size="sm" className="gap-1.5 rounded-md" onClick={actions.onCreate}>
          <PlusIcon className="size-4" />
          {t('contacts.lists.new')}
        </PillButton>
      </DataTable.SmartLists>
      <DataTable.QuickFilters
        filters={state.quickFilters}
        onToggle={actions.onToggleFilter}
        onClear={actions.onClearFilters}
      />
      <DataTable.Toolbar>
        <DataTable.Search
          value={state.search}
          placeholder={t('contacts.searchPlaceholder')}
          onChange={actions.onSearch}
        />
        <span className="ml-auto text-sm tabular-nums text-muted-foreground">
          {t('contacts.count', { count: state.total })}
        </span>
      </DataTable.Toolbar>
      {state.selectedCount > 0 && (
        <DataTable.BulkBar label={t('contacts.bulk.selected', { count: state.selectedCount })}>
          <DataTable.BulkAction destructive onClick={actions.onArchiveSelected}>
            {t('contacts.bulk.archive')}
          </DataTable.BulkAction>
        </DataTable.BulkBar>
      )}
      {state.isPending && <DataTable.Skeleton />}
      {state.isEmpty && (
        <EmptyState
          fill
          icon={<UsersThreeIcon className="size-5" />}
          title={t(state.isFiltered ? 'contacts.noResults.title' : 'contacts.empty.title')}
          description={t(
            state.isFiltered ? 'contacts.noResults.description' : 'contacts.empty.description',
          )}
        >
          {!state.isFiltered && (
            <PillButton size="md" onClick={actions.onCreate}>
              {t('contacts.empty.cta')}
            </PillButton>
          )}
        </EmptyState>
      )}
      {!state.isPending && !state.isEmpty && (
        <>
          <DataTable.Scroller>
            <DataTable.Header />
            <motion.div
              key={state.page}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: state.isFetching ? 0.55 : 1, y: 0 }}
              transition={pageTransition}
            >
              <DataTable.Body />
            </motion.div>
          </DataTable.Scroller>
          <ContactsPagination
            nav={{ page: state.page, totalPages: state.totalPages, limit: state.limit }}
            onPageChange={actions.onPageChange}
            onLimitChange={actions.onLimitChange}
          />
        </>
      )}
    </DataTable>
  )
}
