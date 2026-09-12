'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/shared/lib'

type DrumOption = {
  readonly value: string
  readonly label: string
}

type TimeDrumProps = {
  readonly label: string
  readonly options: ReadonlyArray<DrumOption>
  readonly value: string
  readonly onSelect: (value: string) => void
}

function step(options: ReadonlyArray<DrumOption>, value: string, delta: number): string {
  const index = options.findIndex((option) => option.value === value)
  const next = Math.min(Math.max(index + delta, 0), options.length - 1)
  return options[next]?.value ?? value
}

export function TimeDrum({ label, options, value, onSelect }: Readonly<TimeDrumProps>) {
  const selectedRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ block: 'center' })
  }, [value])

  return (
    <div
      role="listbox"
      aria-label={label}
      data-slot="time-drum"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
        event.preventDefault()
        onSelect(step(options, value, event.key === 'ArrowDown' ? 1 : -1))
      }}
      className="h-40 w-14 snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col items-center gap-0.5 py-16">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              ref={selected ? selectedRef : undefined}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(option.value)}
              className={cn(
                'flex h-8 w-full shrink-0 snap-center items-center justify-center rounded-lg',
                'text-sm tabular-nums transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring/50',
                selected
                  ? 'font-bold text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
