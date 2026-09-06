'use client'

import { useCallback, useMemo, useState } from 'react'

import { buildTagOptions, toggleName, useTagCatalog } from '@/entities/tag'

export function useBulkTagOptions(scope: readonly string[] | null) {
  const catalog = useTagCatalog('contact')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set())

  const toggle = useCallback(
    (name: string) => setSelected((current) => toggleName(current, name)),
    [],
  )

  const options = useMemo(
    () =>
      buildTagOptions({
        catalog,
        names: scope ?? [],
        onlyNames: scope !== null,
        selected,
        query,
      }),
    [catalog, scope, selected, query],
  )

  return {
    query,
    setQuery,
    options,
    toggle,
    selected: [...selected],
    isScoped: scope !== null,
  }
}
