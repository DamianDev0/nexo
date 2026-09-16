import { normalizeSearchText } from '@/shared/lib/search-text'

import type { AsyncSelectSource } from '@/shared/ui/molecules/async-select'
import type { ReactNode } from 'react'

export const CHOICE_SEARCHABLE_FROM = 8

export type ChoiceOption = {
  readonly key: string
  readonly label: string
  readonly color?: string
}

export function choiceSource(
  options: ReadonlyArray<ChoiceOption>,
  renderOption: (option: ChoiceOption) => ReactNode,
): AsyncSelectSource<ChoiceOption> {
  return {
    options,
    getValue: (option) => option.key,
    renderOption,
    filterFn: (option, query) => normalizeSearchText(option.label).includes(query),
  }
}

export function isChoiceSearchable(options: ReadonlyArray<ChoiceOption>): boolean {
  return options.length >= CHOICE_SEARCHABLE_FROM
}
