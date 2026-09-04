'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { ContactsBulkActions } from '@/features/archive-contacts'
import { ContactsListHint } from '@/features/filter-contacts'
import { SaveViewControls } from '@/features/manage-contact-views'
import { ROUTES } from '@/shared/config/routes'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { CloudArrowUpIcon, PlusIcon, UsersThreeIcon } from '@/shared/ui/icons'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { EmptyState } from '@/shared/ui/organisms/empty-state'
import { FilterChips, FilterTrigger } from '@/shared/ui/organisms/filter-bar'
import { BadgeMorph } from '@/shared/ui/ruixen/badge-morph'

import { ContactsPagination } from './ContactsPagination'

import type { ContactsBoard } from '../model/useContactsBoard'
import type { ListMenu } from '../model/useListMenu'

type ContactsTableProps = Readonly<
  Pick<ContactsBoard, 'instance' | 'lists' | 'state' | 'actions'> & { listMenu: ListMenu }
>

export function ContactsTable({ instance, lists, state, actions, listMenu }: ContactsTableProps) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DataTable.SmartLists
        data={lists}
        actions={{
          onSelect: actions.onSelectList,
          onReorder: actions.onReorderLists,
          itemMenu: listMenu.itemMenu,
          menuLabel: listMenu.menuLabel,
        }}
        hotkeys
      >
        <SaveViewControls
          snapshot={state.viewSnapshot}
          activeView={state.activeView}
          onRevert={actions.onRevertFilters}
        />
        <PillButton asChild variant="ghost" size="sm" className="gap-1.5 rounded-md">
          <Link href={ROUTES.app.contacts.import}>
            <CloudArrowUpIcon className="size-4" />
            {t('contacts.import.cta')}
          </Link>
        </PillButton>
        <PillButton size="sm" className="gap-1.5 rounded-md" onClick={actions.onCreate}>
          <PlusIcon className="size-4" />
          {t('contacts.lists.new')}
        </PillButton>
      </DataTable.SmartLists>

      <DataTable.QuickFilters
        filters={state.quickFilters}
        onToggle={actions.onToggleFilter}
        onClear={actions.onClearFilters}
        announcement={<ContactsListHint hints={state.listHints} />}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-2 pt-1">
        <DataTable
          instance={instance}
          className="flex min-h-0 min-w-0 flex-1 flex-col border border-border"
        >
          <DataTable.Toolbar
            bulk={{
              labels: state.bulkLabels,
              actions: (
                <ContactsBulkActions
                  onArchive={actions.onArchiveSelected}
                  disabled={state.isArchiving}
                />
              ),
            }}
          >
            <DataTable.Search
              value={state.search}
              placeholder={t('contacts.searchPlaceholder')}
              onChange={actions.onSearch}
            />
            <FilterChips
              fields={state.advancedFields}
              value={state.advanced}
              onChange={actions.onAdvancedChange}
              className="scrollbar-hidden min-w-0 flex-1 flex-nowrap overflow-x-auto px-1"
            />
            <span className="ml-auto flex shrink-0 items-center gap-2">
              {state.saveStatus !== 'idle' && (
                <BadgeMorph
                  status={state.saveStatus}
                  label={t(`contacts.table.save.${state.saveStatus}`)}
                />
              )}
              <FilterTrigger
                fields={state.advancedFields}
                value={state.advanced}
                onChange={actions.onAdvancedChange}
                iconOnly
              />
              <DataTable.Columns />
              <DataTable.Density />
            </span>
          </DataTable.Toolbar>

          {state.isPending && <DataTable.Skeleton />}

          {state.isUnavailable && (
            <EmptyState
              fill
              icon={<UsersThreeIcon className="size-5" />}
              title={t('contacts.unavailable.title')}
              description={t('contacts.unavailable.description')}
            />
          )}

          {!state.isUnavailable && state.isEmpty && (
            <EmptyState
              fill
              icon={<UsersThreeIcon className="size-5" />}
              title={t(state.isFiltered ? 'contacts.noResults.title' : 'contacts.empty.title', {
                entities: terms.lowerPlural,
              })}
              description={t(
                state.isFiltered ? 'contacts.noResults.description' : 'contacts.empty.description',
                { entity: terms.lowerSingular },
              )}
            >
              {!state.isFiltered && (
                <PillButton size="md" onClick={actions.onCreate}>
                  {t('contacts.empty.cta', { entity: terms.lowerSingular })}
                </PillButton>
              )}
            </EmptyState>
          )}

          {!state.isPending && !state.isEmpty && !state.isUnavailable && (
            <>
              <DataTable.Scroller ref={scrollRef} hideScrollbar className="min-h-0 flex-1">
                <DataTable.Grid>
                  <DataTable.Header />
                  <DataTable.Body pageKey={state.page} dimmed={state.isFetching} />
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
        </DataTable>
      </div>
    </div>
  )
}
