'use client'

import { normalizeCOAddress } from '@repo/shared-utils'
import { useEffect, useMemo, useRef, useState } from 'react'

import { resolveAddressKey } from '../../lib/address-keyboard'
import { buildAddressSuggestions } from '../../lib/address-suggestions'
import { mergeAddressSuggestions } from '../../lib/merge-address-suggestions'
import { useAddressAutocomplete } from '../../query/useAddressAutocomplete'
import { AddressField } from '../AddressField'

import type { AddressOption } from '../../lib/merge-address-suggestions'
import type { AddressFieldActions } from '../AddressField'
import type { KeyboardEvent } from 'react'

export interface AddressPlace {
  readonly mainText: string
  readonly secondaryText: string
}

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
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const sessionTokenRef = useRef<string>(crypto.randomUUID())

  const { places, isSearching } = useAddressAutocomplete(open ? value : '', sessionTokenRef.current)

  const options = useMemo(
    () => (open ? mergeAddressSuggestions(buildAddressSuggestions(value), places) : []),
    [open, value, places],
  )

  useEffect(() => {
    setActiveIndex(-1)
  }, [options.length])

  const actions: AddressFieldActions = useMemo(() => {
    const selectOption = (option: AddressOption) => {
      if (option.kind === 'via') {
        onChange(`${option.value} `)
        setActiveIndex(-1)
        return
      }
      onChange(option.mainText)
      onPlaceSelect?.({ mainText: option.mainText, secondaryText: option.secondaryText })
      sessionTokenRef.current = crypto.randomUUID()
      setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      const action = resolveAddressKey(event.key, activeIndex, options.length)
      if (action.kind === 'move') {
        event.preventDefault()
        setActiveIndex(action.index)
        return
      }
      if (action.kind === 'select') {
        event.preventDefault()
        const option = options[activeIndex]
        if (option) selectOption(option)
        return
      }
      if (action.kind === 'close') setOpen(false)
    }

    return {
      onChange: (next: string) => {
        onChange(next)
        setOpen(true)
      },
      onFocus: () => setOpen(true),
      onBlur: () => {
        setOpen(false)
        onChange(normalizeCOAddress(value))
      },
      onKeyDown,
      onSelect: selectOption,
      onHover: setActiveIndex,
    }
  }, [onChange, onPlaceSelect, value, options, activeIndex])

  return (
    <AddressField
      value={value}
      state={{ options, activeIndex, isSearching, open }}
      actions={actions}
      placeholder={placeholder}
    />
  )
}
