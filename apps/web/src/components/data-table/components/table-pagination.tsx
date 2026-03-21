'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type DataTablePagination } from '../types'

interface TablePaginationProps {
  pagination: DataTablePagination
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function TablePagination({ pagination }: Readonly<TablePaginationProps>) {
  const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1
  const endItem = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []
    const total = pagination.totalPages
    const current = pagination.currentPage

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    pages.push(1)

    if (current > 3) {
      pages.push('ellipsis')
    }

    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    if (current < total - 2) {
      pages.push('ellipsis')
    }

    if (!pages.includes(total)) {
      pages.push(total)
    }

    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {pagination.totalItems} entries
        </p>

        {pagination.onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Show:</span>
            <Select
              value={pagination.itemsPerPage.toString()}
              onValueChange={(value) => pagination.onItemsPerPageChange?.(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="h-8 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {getVisiblePages().map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={pagination.currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => pagination.onPageChange(page)}
              className="h-8 min-w-8"
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="h-8 px-2"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
