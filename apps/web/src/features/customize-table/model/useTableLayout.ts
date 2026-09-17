'use client'

import { useCallback, useMemo } from 'react'

import {
  fromColumnSort,
  toColumnSort,
  useObjectDescriptor,
  type RecordSort,
} from '@/entities/object-descriptor'

import { toDataTableLayout, toTableState } from '../lib/table-layout'
import { useSaveTableState } from '../query/useObjectWorkspace'

import type { DataTableLayout, DataTableSort } from '@/shared/ui/organisms/data-table'
import type { ObjectColumnDef, ObjectTableState } from '@repo/shared-types'

type TableSorting<TField extends string> = {
  readonly value: RecordSort<TField> | null
  readonly onChange: (next: RecordSort<TField> | null) => void
}

export function useTableLayout<TField extends string>(
  catalog: ReadonlyArray<ObjectColumnDef<TField>>,
  tableState: ObjectTableState,
  sorting: TableSorting<TField>,
) {
  const { defaultPinnedColumns } = useObjectDescriptor()
  const { save, status: saveStatus } = useSaveTableState()

  const onLayoutChange = useCallback((next: DataTableLayout) => save(toTableState(next)), [save])

  const layout = useMemo(
    () => ({
      value: toDataTableLayout(tableState, catalog, defaultPinnedColumns),
      onChange: onLayoutChange,
    }),
    [tableState, catalog, defaultPinnedColumns, onLayoutChange],
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

  return { layout, sort, setListOrder, applyState: save, saveStatus }
}
