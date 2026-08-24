import type { AddressOption } from '../../lib/merge-address-suggestions'
import type { KeyboardEvent } from 'react'

export type AddressPlace = {
  readonly mainText: string
  readonly secondaryText: string
}

export type AddressFieldState = {
  readonly options: ReadonlyArray<AddressOption>
  readonly activeIndex: number
  readonly isSearching: boolean
  readonly open: boolean
}

export type AddressFieldActions = {
  readonly onChange: (value: string) => void
  readonly onFocus: () => void
  readonly onBlur: () => void
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  readonly onSelect: (option: AddressOption) => void
  readonly onHover: (index: number) => void
}
