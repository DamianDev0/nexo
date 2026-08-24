'use client'

import { useAddressField } from '../../model/useAddressField'
import { AddressField } from '../AddressField'

import type { AddressPlace } from '../../model/types/address-field.types'

export type { AddressPlace }

interface AddressFieldContainerProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly onPlaceSelect?: (place: AddressPlace) => void
  readonly placeholder?: string
}

export function AddressFieldContainer({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
}: Readonly<AddressFieldContainerProps>) {
  const { state, actions } = useAddressField({ value, onChange, onPlaceSelect })

  return <AddressField value={value} state={state} actions={actions} placeholder={placeholder} />
}
