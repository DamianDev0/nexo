'use client'

import { suggestAddressTypes, normalizeCOAddress } from '@repo/shared-utils'
import { useMemo, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

const MAX_SUGGESTIONS = 5

interface AddressFieldProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
}

function firstToken(value: string): string {
  return value.trimStart().split(' ')[0] ?? ''
}

export function AddressField({ value, onChange, placeholder }: Readonly<AddressFieldProps>) {
  const [focused, setFocused] = useState(false)

  const suggestions = useMemo(() => {
    const token = firstToken(value)
    if (!token || value.trimStart().includes(' ')) return []
    return suggestAddressTypes(token).slice(0, MAX_SUGGESTIONS)
  }, [value])

  const showSuggestions = focused && suggestions.length > 0

  return (
    <div className="relative">
      <Input
        className="h-9 bg-surface-input text-sm"
        placeholder={placeholder}
        autoComplete="street-address"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          onChange(normalizeCOAddress(value))
        }}
      />

      {showSuggestions && (
        <ul className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-e3">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'h-8 w-full justify-start rounded-md px-2.5 text-sm font-normal text-body',
                  'hover:bg-muted hover:text-foreground',
                )}
                onMouseDown={(event) => {
                  event.preventDefault()
                  onChange(`${suggestion} `)
                }}
              >
                {suggestion}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
