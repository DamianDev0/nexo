'use client'

import { useState } from 'react'

import { useTypeaheadList } from '@/shared/lib/hooks/useTypeaheadList'

import { QUICK_FILTER_SEARCH_THRESHOLD } from '../config/quick-filter.constants'

import type { QuickFilterDef, QuickFilterOption } from './types'

function summarize(filter: QuickFilterDef): string | null {
  if (filter.selected.length === 0) return null
  if (filter.selected.length > 1) return `+${filter.selected.length}`
  return filter.options.find((option) => option.value === filter.selected[0])?.label ?? null
}

export function useQuickFilter(filter: QuickFilterDef) {
  const [open, setOpen] = useState(false)
  const typeahead = useTypeaheadList<QuickFilterOption>(filter.options, {
    getValue: (option) => option.value,
    getLabel: (option) => option.label,
  })

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) typeahead.reset()
  }

  return {
    open,
    onOpenChange,
    active: filter.selected.length > 0,
    summary: summarize(filter),
    searchable: filter.options.length > QUICK_FILTER_SEARCH_THRESHOLD,
    term: typeahead.term,
    setTerm: typeahead.setTerm,
    visible: typeahead.visible,
    highlightedValue: typeahead.highlightedValue,
    setHighlighted: typeahead.setHighlighted,
  }
}
