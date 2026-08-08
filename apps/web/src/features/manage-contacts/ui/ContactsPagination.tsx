'use client'

import { useTranslation } from 'react-i18next'

import { PAGE_SIZE_OPTIONS } from '@/shared/config/pagination'
import { DataTable } from '@/shared/ui/organisms/data-table'

interface ContactsPaginationProps {
  readonly nav: { page: number; totalPages: number; limit: number }
  readonly onPageChange: (page: number) => void
  readonly onLimitChange: (limit: number) => void
}

export function ContactsPagination({
  nav,
  onPageChange,
  onLimitChange,
}: Readonly<ContactsPaginationProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex justify-end px-4 py-4">
      <DataTable.Pagination>
        <DataTable.Pagination.Nav
          page={nav.page}
          totalPages={nav.totalPages}
          onPageChange={onPageChange}
          labels={{
            root: t('contacts.pagination.pages'),
            prev: t('contacts.pagination.prev'),
            next: t('contacts.pagination.next'),
          }}
        />
        <DataTable.Pagination.Divider />
        <DataTable.Pagination.PageSize
          value={nav.limit}
          options={PAGE_SIZE_OPTIONS}
          onChange={onLimitChange}
          label={t('contacts.pagination.perPage')}
        />
        <DataTable.Pagination.Divider />
        <DataTable.Pagination.Progress value={(nav.page / Math.max(1, nav.totalPages)) * 100} />
        <DataTable.Pagination.Divider />
        <DataTable.Pagination.JumpEnd onClick={() => onPageChange(nav.totalPages)} />
      </DataTable.Pagination>
    </div>
  )
}
