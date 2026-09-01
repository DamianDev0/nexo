'use client'

import { useRef } from 'react'

import { cn } from '@/shared/lib'
import { optionTileClass } from '@/shared/ui/molecules/option-tile'

import type { KeyboardEvent, ReactNode } from 'react'

export type TileRadioOption<T extends string> = {
  readonly value: T
  readonly content: ReactNode
}

type TileRadioClasses = {
  readonly group?: string
  readonly tile?: string
}

type TileRadioGroupProps<T extends string> = {
  readonly value: T | null
  readonly onChange: (value: T) => void
  readonly options: ReadonlyArray<TileRadioOption<T>>
  readonly label: string
  readonly classes?: TileRadioClasses
}

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown'])
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp'])

export function TileRadioGroup<T extends string>({
  value,
  onChange,
  options,
  label,
  classes,
}: Readonly<TileRadioGroupProps<T>>) {
  const itemsRef = useRef<Map<T, HTMLButtonElement>>(new Map())
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = NEXT_KEYS.has(event.key) ? 1 : PREV_KEYS.has(event.key) ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const next = options[(activeIndex + step + options.length) % options.length]
    if (!next) return
    onChange(next.value)
    itemsRef.current.get(next.value)?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('grid gap-2', classes?.group)}
      onKeyDown={handleKeyDown}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(node) => {
            if (node) itemsRef.current.set(option.value, node)
            else itemsRef.current.delete(option.value)
          }}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          tabIndex={index === activeIndex ? 0 : -1}
          onClick={() => onChange(option.value)}
          className={optionTileClass(value === option.value, classes?.tile)}
        >
          {option.content}
        </button>
      ))}
    </div>
  )
}
