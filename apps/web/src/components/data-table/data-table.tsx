/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { type DataTableProps } from './types'
import { TableSearch, ColumnHeader, ExpandedRow, TablePagination, RowActions } from './components'
import { useTableSort, useTableFilter, useExpandableRows } from './hooks'

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowAction,
  onRowClick,
  actions = [
    { label: 'Edit', value: 'edit' },
    { label: 'Delete', value: 'delete' },
  ],
  pagination,
  emptyMessage = 'No data available',
  isLoading = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  expandable = false,
  renderExpandedRow,
}: Readonly<DataTableProps<T>>) {
  const { handleSort, getSortDirection } = useTableSort()
  const { getFilterValue, setFilter, clearFilter } = useTableFilter()
  const { toggleRow, isExpanded } = useExpandableRows()

  // Helper to get actions for an item (supports both array and function)
  const getActionsForItem = (item: T) => {
    if (typeof actions === 'function') {
      return actions(item)
    }
    return actions
  }

  // Check if actions column should be shown
  const hasActionsColumn = onRowAction && (typeof actions === 'function' || actions.length > 0)

  const totalColumns = columns.length + (hasActionsColumn ? 1 : 0) + (expandable ? 1 : 0)

  return (
    <div className="w-full space-y-4">
      {/* Toolbar: Search (right) */}
      {searchable && onSearch && (
        <div className="flex items-center justify-end">
          <TableSearch onChange={onSearch} placeholder={searchPlaceholder} />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {expandable && <TableHead className="w-12 py-3 px-2" />}
                {columns.map((column) => (
                  <TableHead key={column.key} className={cn('py-3 px-4', column.className)}>
                    <ColumnHeader
                      title={column.header}
                      sortable={column.sortable}
                      filterable={column.filterable}
                      sortDirection={getSortDirection(column.key)}
                      filterValue={getFilterValue(column.key)}
                      onSort={() => handleSort(column.key)}
                      onFilter={(value) => setFilter(column.key, value)}
                      onClearFilter={() => clearFilter(column.key)}
                    />
                  </TableHead>
                ))}
                {hasActionsColumn && (
                  <TableHead className="text-right py-3 px-4 w-20">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="h-24 text-center">
                    <span className="text-muted-foreground">{emptyMessage}</span>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                data.length > 0 &&
                data.map((item, index) => {
                  const rowId = item.id || index
                  const expanded = isExpanded(rowId)

                  return (
                    <React.Fragment key={rowId}>
                      <TableRow
                        className={cn('border-border', onRowClick && 'hover:bg-muted/50')}
                        onDoubleClick={() => onRowClick?.(item)}
                      >
                        {expandable && (
                          <TableCell className="py-3 px-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleRow(rowId)
                              }}
                            >
                              {expanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell key={column.key} className={cn('py-3 px-4', column.className)}>
                            {column.render ? column.render(item) : item[column.key]}
                          </TableCell>
                        ))}
                        {hasActionsColumn && (
                          <TableCell className="text-right py-3 px-4">
                            <RowActions
                              item={item}
                              actions={getActionsForItem(item)}
                              onAction={onRowAction}
                            />
                          </TableCell>
                        )}
                      </TableRow>

                      {expandable && renderExpandedRow && (
                        <ExpandedRow isExpanded={expanded} colSpan={totalColumns}>
                          {renderExpandedRow(item)}
                        </ExpandedRow>
                      )}
                    </React.Fragment>
                  )
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && <TablePagination pagination={pagination} />}
    </div>
  )
}
