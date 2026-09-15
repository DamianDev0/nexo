'use client'

import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { BulkActionBar, BulkDialogs } from '@/features/bulk-actions'
import {
  ContactsListHint,
  LIST_ALL,
  LIST_UNASSIGNED,
  UnassignedBadge,
} from '@/features/filter-contacts'
import { SaveViewControls } from '@/features/manage-contact-views'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { DotsThreeVerticalIcon, PlusIcon } from '@/shared/ui/icons'
import { ActionMenu } from '@/shared/ui/molecules/action-menu'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { FilterChips, FilterTrigger } from '@/shared/ui/organisms/filter-bar'
import { BadgeMorph } from '@/shared/ui/ruixen/badge-morph'

import { buildToolbarMenu } from '../lib/toolbar-menu'

import { ContactsTableStates } from './ContactsTableStates'

import type { ContactsBoard } from '../model/useContactsBoard'
import type { ListMenu } from '../model/useListMenu'

type ContactsTableProps = {
  readonly board: Pick<ContactsBoard, 'instance' | 'lists' | 'state' | 'actions'>
  readonly bulk: ContactsBoard['bulk']
  readonly listMenu: ListMenu
}

export function ContactsTable({ board, bulk, listMenu }: Readonly<ContactsTableProps>) {
  const { instance, lists, state, actions } = board
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const scrollRef = useRef<HTMLDivElement>(null)
  const toolbarMenu = useMemo(() => buildToolbarMenu(t), [t])

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
        <ActionMenu items={toolbarMenu} align="end">
          <PillButton
            variant="ghost"
            size="sm"
            className="w-9 px-0"
            aria-label={t('contacts.toolbar.more')}
          >
            <DotsThreeVerticalIcon className="size-4" />
          </PillButton>
        </ActionMenu>
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
              labels: bulk.bar.labels,
              onSelectAll: bulk.bar.onSelectAll,
              actions: <BulkActionBar bar={bulk.bar} />,
            }}
          >
            <DataTable.Search
              value={state.search}
              placeholder={t('contacts.searchPlaceholder')}
              onChange={actions.onSearch}
            />
            <UnassignedBadge
              count={state.unassignedRecent}
              active={lists.activeId === LIST_UNASSIGNED}
              terms={{ entity: terms.lowerSingular, entities: terms.lowerPlural }}
              onSelect={() => actions.onSelectList(LIST_UNASSIGNED)}
              onClear={() => actions.onSelectList(LIST_ALL)}
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

          <ContactsTableStates
            state={state}
            actions={actions}
            terms={terms}
            scrollRef={scrollRef}
          />
        </DataTable>
      </div>
      <BulkDialogs dialogs={bulk.dialogs} />
    </div>
  )
}
