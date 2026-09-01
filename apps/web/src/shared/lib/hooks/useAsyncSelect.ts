'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { useTypeaheadList } from '@/shared/lib/hooks/useTypeaheadList'

const ASYNC_SELECT_STALE_MS = 60 * 1000
const ASYNC_SELECT_DEBOUNCE_MS = 300

type AsyncSourceBase<T> = {
  readonly getValue: (option: T) => string
  readonly filterFn?: (option: T, query: string) => boolean
}

export type AsyncOptionSource<T> = AsyncSourceBase<T> &
  (
    | { readonly options: ReadonlyArray<T>; readonly key?: never; readonly fetcher?: never }
    | {
        readonly options?: never
        readonly key: string
        readonly fetcher: (query: string) => Promise<ReadonlyArray<T>>
      }
  )

export function useAsyncSelect<T>(source: AsyncOptionSource<T>, onSelect: (option: T) => void) {
  const [open, setOpen] = useState(false)
  const filterFn = source.filterFn
  const typeahead = useTypeaheadList<T>(source.options ?? [], {
    getValue: source.getValue,
    getLabel: (option) => source.getValue(option),
    matches: filterFn ? (option, needle) => filterFn(option, needle) : () => true,
  })
  const debounced = useDebouncedValue(typeahead.term, source.options ? 0 : ASYNC_SELECT_DEBOUNCE_MS)

  const query = useQuery({
    queryKey: ['async-select', source.key ?? 'static', debounced],
    queryFn: async () => (source.fetcher ? source.fetcher(debounced) : []),
    enabled: open && Boolean(source.fetcher),
    staleTime: ASYNC_SELECT_STALE_MS,
    placeholderData: keepPreviousData,
  })

  const visible = source.options ? typeahead.visible : (query.data ?? [])
  const loading = Boolean(source.fetcher) && open && query.isFetching
  const failed = Boolean(source.fetcher) && query.isError

  const first = visible[0]
  const highlightedValue = visible.some(
    (option) => source.getValue(option) === typeahead.highlightedValue,
  )
    ? typeahead.highlightedValue
    : first !== undefined
      ? source.getValue(first)
      : ''

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) typeahead.reset()
  }

  const select = (option: T) => {
    onSelect(option)
    typeahead.reset()
    setOpen(false)
  }

  return {
    open,
    onOpenChange,
    term: typeahead.term,
    setTerm: typeahead.setTerm,
    visible,
    highlightedValue,
    setHighlighted: typeahead.setHighlighted,
    loading,
    failed,
    select,
  }
}
