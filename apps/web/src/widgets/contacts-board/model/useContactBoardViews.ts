'use client'

import { useMemo } from 'react'

import { useBoardViews } from '@/widgets/records-board'

import { toBoardViewsTable, type ContactViewsTable } from '../lib/contact-board-lists'

type ContactBoardViewsArgs = Omit<Parameters<typeof useBoardViews>[0], 'table'> & {
  readonly table: ContactViewsTable
}

export function useContactBoardViews({ table, ...rest }: ContactBoardViewsArgs) {
  const {
    advanced,
    search,
    sort,
    isFiltered,
    handleAdvanced,
    handleSearch,
    handleSort,
    handleStatus,
  } = table
  const viewsTable = useMemo(
    () =>
      toBoardViewsTable({
        advanced,
        search,
        sort,
        isFiltered,
        handleAdvanced,
        handleSearch,
        handleSort,
        handleStatus,
      }),
    [advanced, search, sort, isFiltered, handleAdvanced, handleSearch, handleSort, handleStatus],
  )

  return useBoardViews({ ...rest, table: viewsTable })
}
