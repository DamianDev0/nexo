'use client'

import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { cn } from '@/utils'
import { Checkbox } from '@/components/atoms/checkbox'
import { Button } from '@/components/atoms/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/organisms/table'

import type { DataTableProps } from './types'
import { DataTableToolbar } from './DataTableToolbar'
import { DataTablePagination } from './DataTablePagination'
import { DataTableRowActions } from './DataTableRowActions'
import { DataTableBulkBar } from './DataTableBulkBar'
import { DataTableSkeleton } from './DataTableSkeleton'
import { DataTableEmptyState } from './DataTableEmptyState'

// ─── Helpers ────────────────────────────────────────────────────────

function buildSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  }
}

function buildActionsColumn<TData>(
  actions: DataTableProps<TData>['actions'],
  onRowAction: (action: string, item: TData) => void,
): ColumnDef<TData, unknown> {
  return {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const rowActions = typeof actions === 'function' ? actions(row.original) : (actions ?? [])
      return <DataTableRowActions item={row.original} actions={rowActions} onAction={onRowAction} />
    },
    size: 48,
    enableSorting: false,
    enableHiding: false,
  }
}

function buildExpandColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'expand',
    header: () => null,
    cell: ({ row }) => {
      if (!row.getCanExpand()) return null
      return (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation()
            row.toggleExpanded()
          }}
          aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
        >
          {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
        </Button>
      )
    },
    size: 36,
    enableSorting: false,
    enableHiding: false,
  }
}

// ─── DataTable ──────────────────────────────────────────────────────

export function DataTable<TData>({
  columns,
  data,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  pagination,
  actions,
  bulkActions,
  onBulkAction,
  onRowClick,
  getRowId,
  searchable,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  isLoading,
  emptyState,
  className,
  stickyHeader = true,
  expandable,
  renderExpandedRow,
  toolbarContent,
}: DataTableProps<TData>) {
  // Build final columns array
  const finalColumns: ColumnDef<TData, unknown>[] = []

  if (expandable && renderExpandedRow) {
    finalColumns.push(buildExpandColumn<TData>())
  }

  if (rowSelection !== undefined && onRowSelectionChange) {
    finalColumns.push(buildSelectionColumn<TData>())
  }

  finalColumns.push(...columns)

  if (actions) {
    finalColumns.push(
      buildActionsColumn<TData>(actions, (action, item) => {
        // Propagate via onBulkAction with single item or a dedicated handler
        // For row-level actions, we use the onRowAction pattern via the actions prop
        onBulkAction?.(action, [item])
      }),
    )
  }

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting: sorting ?? [],
      columnFilters: columnFilters ?? [],
      columnVisibility: columnVisibility ?? {},
      rowSelection: rowSelection ?? {},
    },
    onSortingChange: onSortingChange
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(sorting ?? []) : updater
          onSortingChange(next)
        }
      : undefined,
    onColumnFiltersChange: onColumnFiltersChange
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(columnFilters ?? []) : updater
          onColumnFiltersChange(next)
        }
      : undefined,
    onColumnVisibilityChange: onColumnVisibilityChange
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(columnVisibility ?? {}) : updater
          onColumnVisibilityChange(next)
        }
      : undefined,
    onRowSelectionChange: onRowSelectionChange
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(rowSelection ?? {}) : updater
          onRowSelectionChange(next)
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: onSortingChange ? getSortedRowModel() : undefined,
    getFilteredRowModel: onColumnFiltersChange ? getFilteredRowModel() : undefined,
    getExpandedRowModel: expandable ? getExpandedRowModel() : undefined,
    getRowCanExpand: expandable ? () => true : undefined,
    getRowId,
    enableRowSelection: rowSelection !== undefined,
    manualPagination: true,
    manualSorting: Boolean(onSortingChange),
    manualFiltering: Boolean(onColumnFiltersChange),
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelection = rowSelection !== undefined && Boolean(onRowSelectionChange)

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('w-full space-y-4', className)}>
        <DataTableSkeleton
          columnCount={columns.length}
          hasCheckbox={hasSelection}
          hasActions={Boolean(actions)}
        />
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Toolbar */}
      <DataTableToolbar
        searchable={searchable}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      >
        {toolbarContent}
      </DataTableToolbar>

      {/* Bulk actions bar */}
      {hasSelection && bulkActions && onBulkAction && (
        <DataTableBulkBar
          selectedCount={selectedRows.length}
          bulkActions={bulkActions}
          onAction={(action) =>
            onBulkAction(
              action,
              selectedRows.map((r) => r.original),
            )
          }
          onClearSelection={() => onRowSelectionChange?.({})}
        />
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={stickyHeader ? 'sticky top-0 z-10 bg-card' : undefined}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-3 px-4"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={finalColumns.length} className="h-48">
                    <DataTableEmptyState emptyState={emptyState} />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isExpandable = expandable && renderExpandedRow && row.getIsExpanded()

                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() ? 'selected' : undefined}
                        className={cn(
                          'border-border',
                          onRowClick && 'cursor-pointer hover:bg-muted/50',
                        )}
                        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3 px-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                      {isExpandable && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={finalColumns.length} className="p-4">
                            {renderExpandedRow(row.original)}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <DataTablePagination pagination={pagination} selectedCount={selectedRows.length} />
      )}
    </div>
  )
}
