'use client'

import { useState } from 'react'

import { normalizeSearchText } from '@/shared/lib/search-text'

interface TypeaheadSource<T> {
  readonly getValue: (item: T) => string
  readonly getLabel: (item: T) => string
  readonly matches?: (item: T, needle: string) => boolean
}

export function useTypeaheadList<T>(items: ReadonlyArray<T>, source: TypeaheadSource<T>) {
  const [term, setTerm] = useState('')
  const [highlighted, setHighlighted] = useState('')

  const needle = normalizeSearchText(term.trim())
  const matches =
    source.matches ?? ((item: T, n: string) => normalizeSearchText(source.getLabel(item)).includes(n))
  const visible = needle ? items.filter((item) => matches(item, needle)) : items

  const first = visible[0]
  const highlightedValue = visible.some((item) => source.getValue(item) === highlighted)
    ? highlighted
    : first !== undefined
      ? source.getValue(first)
      : ''

  const reset = () => {
    setTerm('')
    setHighlighted('')
  }

  return { term, setTerm, visible, highlightedValue, setHighlighted, reset }
}
