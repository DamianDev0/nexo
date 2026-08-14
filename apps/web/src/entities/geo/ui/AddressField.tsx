'use client'

import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { CircleNotchIcon, MapPinIcon, SignpostIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

import type { AddressOption } from '../lib/merge-address-suggestions'
import type { KeyboardEvent } from 'react'

export interface AddressFieldActions {
  readonly onChange: (value: string) => void
  readonly onFocus: () => void
  readonly onBlur: () => void
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  readonly onSelect: (option: AddressOption) => void
  readonly onHover: (index: number) => void
}

export interface AddressFieldState {
  readonly options: ReadonlyArray<AddressOption>
  readonly activeIndex: number
  readonly isSearching: boolean
  readonly open: boolean
}

interface AddressFieldProps {
  readonly value: string
  readonly state: AddressFieldState
  readonly actions: AddressFieldActions
  readonly placeholder?: string
}

export function AddressField({ value, state, actions, placeholder }: Readonly<AddressFieldProps>) {
  const { t } = useTranslation()
  const listboxId = useId()
  const { options, activeIndex, isSearching, open } = state

  const firstPlaceIndex = options.findIndex((option) => option.kind === 'place')
  const hasVias = options.some((option) => option.kind === 'via')
  const showPanel = open && options.length > 0
  const optionId = (index: number) => `${listboxId}-option-${index}`

  return (
    <div className="relative">
      <Input
        className="h-9 bg-surface-input pr-8 text-sm"
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-autocomplete="list"
        value={value}
        onChange={(event) => actions.onChange(event.target.value)}
        onFocus={actions.onFocus}
        onBlur={actions.onBlur}
        onKeyDown={actions.onKeyDown}
      />
      {isSearching && (
        <CircleNotchIcon className="absolute top-2.5 right-2.5 size-4 animate-spin text-muted-foreground" />
      )}

      {showPanel && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-e3"
        >
          {hasVias && (
            <li
              role="presentation"
              className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground"
            >
              {t('geo.streetTypes')}
            </li>
          )}
          {options.map((option, index) => (
            <li key={`${option.kind}-${option.value}`} role="presentation">
              {index === firstPlaceIndex && (
                <div
                  role="presentation"
                  className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground"
                >
                  {t('geo.addresses')}
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  'h-auto min-h-8 w-full justify-start gap-2 rounded-md px-2.5 py-1.5 text-sm font-normal text-body',
                  index === activeIndex && 'bg-muted text-foreground',
                )}
                onMouseEnter={() => actions.onHover(index)}
                onMouseDown={(event) => {
                  event.preventDefault()
                  actions.onSelect(option)
                }}
              >
                {option.kind === 'via' ? (
                  <>
                    <SignpostIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{option.value}</span>
                  </>
                ) : (
                  <>
                    <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex min-w-0 flex-col items-start text-left">
                      <span className="w-full truncate">{option.mainText}</span>
                      {option.secondaryText && (
                        <span className="w-full truncate text-xs text-muted-foreground">
                          {option.secondaryText}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </Button>
            </li>
          ))}
          {firstPlaceIndex >= 0 && (
            <li
              role="presentation"
              className="border-t border-border px-2.5 pt-1.5 pb-0.5 text-right text-xs text-muted-foreground"
            >
              {t('geo.poweredByGoogle')}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
