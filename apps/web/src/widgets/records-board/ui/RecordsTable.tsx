'use client'

import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { useObjectDescriptor } from '@/entities/object-descriptor'
import { BulkActionBar, BulkDialogs } from '@/features/bulk-actions'
import { SaveViewControls } from '@/features/manage-views'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { DotsThreeVerticalIcon, PlusIcon } from '@/shared/ui/icons'
import { ActionMenu } from '@/shared/ui/molecules/action-menu'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { FilterChips, FilterTrigger } from '@/shared/ui/organisms/filter-bar'
import { BadgeMorph } from '@/shared/ui/ruixen/badge-morph'

import { RecordsTableStates } from './RecordsTableStates'

import type {
  RecordsBoardActions,
  RecordsBoardLists,
  RecordsBoardState,
} from '../model/types/records-board.types'
import type { ListMenu } from '../model/useListMenu'
import type { BulkActionsController } from '@/features/bulk-actions'
import type { ActionMenuItem } from '@/shared/ui/molecules/action-menu'
import type { DataTableInstance } from '@/shared/ui/organisms/data-table'
import type { ReactNode } from 'react'

export type RecordsTableBoard<TRecord> = {
  readonly instance: DataTableInstance<TRecord>
  readonly lists: RecordsBoardLists
  readonly state: RecordsBoardState
  readonly actions: RecordsBoardActions
}

export type RecordsTableSlots = {
  readonly toolbarMenu: ReadonlyArray<ActionMenuItem>
  readonly announcement?: ReactNode
  readonly searchExtras?: ReactNode
}

type RecordsTableProps<TRecord> = {
  readonly board: RecordsTableBoard<TRecord>
  readonly bulk: BulkActionsController
  readonly listMenu: ListMenu
  readonly slots: RecordsTableSlots
}

export function RecordsTable<TRecord>({
  board,
  bulk,
  listMenu,
  slots,
}: Readonly<RecordsTableProps<TRecord>>) {
  const { instance, lists, state, actions } = board
  const { t } = useTranslation()
  const descriptor = useObjectDescriptor()
  const terms = useEntityTerms(descriptor.type)
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
        <ActionMenu items={slots.toolbarMenu} align="end">
          <PillButton
            variant="ghost"
            size="sm"
            className="w-9 px-0"
            aria-label={t('records.toolbar.more')}
          >
            <DotsThreeVerticalIcon className="size-4" />
          </PillButton>
        </ActionMenu>
        <PillButton size="sm" className="gap-1.5 rounded-md" onClick={actions.onCreate}>
          <PlusIcon className="size-4" />
          {t('records.toolbar.create', { entity: terms.lowerSingular })}
        </PillButton>
      </DataTable.SmartLists>

      <DataTable.QuickFilters
        filters={state.quickFilters}
        onToggle={actions.onToggleFilter}
        onClear={actions.onClearFilters}
        announcement={slots.announcement}
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
              onUnselectAll: bulk.bar.onUnselectAll,
              actions: <BulkActionBar bar={bulk.bar} />,
            }}
          >
            <DataTable.Search
              value={state.search}
              placeholder={t(descriptor.searchPlaceholderKey)}
              onChange={actions.onSearch}
            />
            {slots.searchExtras}
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
                  label={t(`records.table.save.${state.saveStatus}`)}
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

          <RecordsTableStates state={state} actions={actions} terms={terms} scrollRef={scrollRef} />
        </DataTable>
      </div>
      <BulkDialogs dialogs={bulk.dialogs} />
    </div>
  )
}
