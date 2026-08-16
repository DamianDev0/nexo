'use client'

import { useCallback, useMemo } from 'react'

import { fromColumnSort, toColumnSort, type ContactSort } from '@/entities/contact'

import { toContactTableState, toDataTableLayout } from '../lib/contact-table-layout'
import { useSaveContactTableState } from '../query/useContactWorkspace'

import type { DataTableLayout, DataTableSort } from '@/shared/ui/organisms/data-table'
import type { ContactColumnDef, ContactTableState } from '@repo/shared-types'

export function useContactsLayout(
  catalog: ReadonlyArray<ContactColumnDef>,
  tableState: ContactTableState,
  sorting: { value: ContactSort | null; onChange: (next: ContactSort | null) => void },
) {
  const { save, status: saveStatus } = useSaveContactTableState()

  const onLayoutChange = useCallback(
    (next: DataTableLayout) => save(toContactTableState(next)),
    [save],
  )

  const layout = useMemo(
    () => ({ value: toDataTableLayout(tableState, catalog), onChange: onLayoutChange }),
    [tableState, catalog, onLayoutChange],
  )

  const onSortChange = sorting.onChange
  const sortValue = sorting.value

  const sort = useMemo(
    () => ({
      value: toColumnSort(sortValue, catalog),
      onChange: (next: DataTableSort | null) => onSortChange(fromColumnSort(next, catalog)),
    }),
    [sortValue, catalog, onSortChange],
  )

  const setListOrder = useCallback(
    (listOrder: ReadonlyArray<string>) => save({ listOrder: [...listOrder] }),
    [save],
  )

  return { layout, sort, setListOrder, saveStatus }
}
