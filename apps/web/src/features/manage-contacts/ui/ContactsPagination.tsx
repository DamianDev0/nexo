'use client'

import { useTranslation } from 'react-i18next'

import { PAGE_SIZE_OPTIONS } from '@/shared/config/pagination'
import { DataTable } from '@/shared/ui/organisms/data-table'

import type { RefObject } from 'react'

interface ContactsPaginationProps {
  readonly nav: { page: number; totalPages: number; limit: number }
  readonly scrollTarget: RefObject<HTMLElement | null>
  readonly onPageChange: (page: number) => void
  readonly onLimitChange: (limit: number) => void
}

export function ContactsPagination({
  nav,
  scrollTarget,
  onPageChange,
  onLimitChange,
}: Readonly<ContactsPaginationProps>) {
  const { t } = useTranslation()

  return (
    <div className="mt-auto flex shrink-0 justify-end px-7 py-4">
      <DataTable.Pagination
        label={t('common.pagination.pages')}
        collapseLabel={t('common.pagination.collapse')}
      >
        <DataTable.Pagination.Nav
          page={nav.page}
          totalPages={nav.totalPages}
          onPageChange={onPageChange}
          labels={{ prev: t('common.pagination.prev'), next: t('common.pagination.next') }}
        />
        <DataTable.Pagination.Divider />
        <DataTable.Pagination.PageSize
          value={nav.limit}
          options={PAGE_SIZE_OPTIONS}
          onChange={onLimitChange}
          label={t('common.pagination.perPage')}
        />
        <DataTable.Pagination.Divider />
        <DataTable.Pagination.ScrollTrack
          target={scrollTarget}
          label={t('common.pagination.scroll')}
        />
      </DataTable.Pagination>
    </div>
  )
}
