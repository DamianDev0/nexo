'use client'

import { Plus, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { DataTable, useDataTable } from '@/shared/ui/organisms/data-table'
import { EmptyState } from '@/shared/ui/organisms/empty-state'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { buildSmartLists, listIdToStatus, statusToListId } from '../model/contact-lists'
import { useArchiveContact } from '../model/useArchiveContact'
import { useContactCounts } from '../model/useContactCounts'
import { useContactsTable } from '../model/useContactsTable'

import { buildContactColumns } from './contact-columns'
import { ContactFormSheet } from './ContactFormSheet'
import { ContactsPagination } from './ContactsPagination'

import type { ContactListItem } from '@repo/shared-types'

export function ContactsTable() {
  const { t } = useTranslation()
  const table = useContactsTable()
  const { archive } = useArchiveContact()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<ContactListItem | null>(null)

  const columns = useMemo(
    () =>
      buildContactColumns(t, {
        onEdit: (contact) => {
          setEditing(contact)
          setSheetOpen(true)
        },
        onArchive: (contact) => archive([contact.id]),
      }),
    [t, archive],
  )

  const instance = useDataTable({
    data: table.rows,
    columns,
    pageSize: table.limit,
    getRowId: (row) => row.id,
  })
  const selectedRows = instance.table.getSelectedRowModel().rows
  const counts = useContactCounts()
  const [listOrder, setListOrder] = useState<readonly string[] | null>(null)
  const smartLists = useMemo(() => {
    const built = buildSmartLists(t, counts)
    if (!listOrder) return built
    return [...built].sort((a, b) => listOrder.indexOf(a.id) - listOrder.indexOf(b.id))
  }, [t, counts, listOrder])
  const showEmpty = !table.isPending && table.rows.length === 0

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DataTable instance={instance} className="flex flex-1 flex-col rounded-none bg-transparent">
        <DataTable.SmartLists
          data={{ items: smartLists, activeId: statusToListId(table.status) }}
          onSelect={(id) => table.handleStatus(listIdToStatus(id))}
          onReorder={setListOrder}
        >
          <PillButton
            size="sm"
            className="h-9.5 gap-1 rounded-md px-3.5"
            onClick={() => {
              setEditing(null)
              setSheetOpen(true)
            }}
          >
            <Plus className="size-4" />
            {t('contacts.lists.new')}
          </PillButton>
        </DataTable.SmartLists>
        <DataTable.Toolbar>
          <DataTable.Search
            value={table.search}
            placeholder={t('contacts.searchPlaceholder')}
            onChange={table.handleSearch}
          />
          <span className="ml-auto text-sm tabular-nums text-muted-foreground">
            {t('contacts.count', { count: table.total })}
          </span>
        </DataTable.Toolbar>
        {selectedRows.length > 0 && (
          <DataTable.BulkBar label={t('contacts.bulk.selected', { count: selectedRows.length })}>
            <DataTable.BulkAction
              destructive
              onClick={() => {
                archive(selectedRows.map((row) => row.original.id))
                instance.table.resetRowSelection()
              }}
            >
              {t('contacts.bulk.archive')}
            </DataTable.BulkAction>
          </DataTable.BulkBar>
        )}
        {table.isPending && (
          <div className="flex flex-col gap-2.5 px-4 pb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={`row-${i + 1}`} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )}
        {showEmpty && (
          <EmptyState
            icon={<UsersRound className="size-5" />}
            title={t(table.isFiltered ? 'contacts.noResults.title' : 'contacts.empty.title')}
            description={t(
              table.isFiltered ? 'contacts.noResults.description' : 'contacts.empty.description',
            )}
            className="min-h-[26rem] flex-1 justify-center rounded-none"
          >
            {!table.isFiltered && (
              <PillButton size="md" onClick={() => setSheetOpen(true)}>
                {t('contacts.empty.cta')}
              </PillButton>
            )}
          </EmptyState>
        )}
        {!table.isPending && table.rows.length > 0 && (
          <>
            <DataTable.Header />
            <DataTable.Body />
            <ContactsPagination
              nav={{ page: table.page, totalPages: table.totalPages, limit: table.limit }}
              onPageChange={table.setPage}
              onLimitChange={table.handleLimit}
            />
          </>
        )}
      </DataTable>
      <ContactFormSheet contact={editing} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
