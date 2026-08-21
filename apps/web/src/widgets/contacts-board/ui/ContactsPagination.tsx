'use client'

import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'

import { PAGE_SIZE_OPTIONS } from '@/shared/config/pagination'
import { DataTable } from '@/shared/ui/organisms/data-table'

import { pageRange } from '../lib/page-range'

import type { RefObject } from 'react'

interface ContactsPaginationProps {
  readonly nav: { page: number; totalPages: number; limit: number; total: number }
  readonly scrollTarget: RefObject<HTMLElement | null>
  readonly onPageChange: (page: number) => void
  readonly onPrefetchPage: (page: number) => void
  readonly onLimitChange: (limit: number) => void
}

export function ContactsPagination({
  nav,
  scrollTarget,
  onPageChange,
  onPrefetchPage,
  onLimitChange,
}: Readonly<ContactsPaginationProps>) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const range = pageRange(nav.page, nav.limit, nav.total)

  return (
    <div className="mt-auto flex shrink-0 items-center justify-between gap-4 px-7 py-1.5">
      <span className="truncate text-xs tabular-nums text-muted-foreground">
        {t('contacts.pageRange', {
          from: range.from,
          to: range.to,
          total: range.total,
          entities: terms.lowerPlural,
        })}
      </span>

      <DataTable.Pagination
        label={t('common.pagination.pages')}
        collapseLabel={t('common.pagination.collapse')}
      >
        <DataTable.Pagination.Nav
          page={nav.page}
          totalPages={nav.totalPages}
          onPageChange={onPageChange}
          onPrefetch={onPrefetchPage}
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
