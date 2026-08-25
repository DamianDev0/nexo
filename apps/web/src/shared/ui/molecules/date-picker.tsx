'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { enUS, es } from 'react-day-picker/locale'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'

interface DatePickerProps {
  readonly value?: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly 'aria-label'?: string
  readonly disabled?: boolean
}

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function toDisplayDate(value?: string): string {
  const date = parseIsoDate(value)
  if (!date) return ''
  return `${`${date.getDate()}`.padStart(2, '0')}/${`${date.getMonth() + 1}`.padStart(2, '0')}/${date.getFullYear()}`
}

const DAY_PICKER_CLASSNAMES = {
  months: 'relative flex flex-col',
  month_caption: 'flex h-9 items-center justify-center',
  caption_label: 'text-sm font-semibold text-foreground capitalize',
  nav: 'absolute inset-x-1 top-0 z-10 flex h-9 items-center justify-between',
  button_previous:
    'flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
  button_next:
    'flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
  month_grid: 'mt-1 border-separate border-spacing-0.5',
  weekday: 'size-8 text-[11px] font-semibold uppercase text-muted-foreground',
  day: 'p-0 text-center',
  day_button:
    'size-8 rounded-md text-sm text-body transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40',
  selected: '[&>button]:bg-primary [&>button]:font-bold [&>button]:text-primary-foreground',
  today: '[&>button:not(:hover)]:bg-muted/60 [&>button]:font-semibold',
  outside: '[&>button]:text-faint',
  hidden: 'invisible',
} as const

export function DatePicker({
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
  disabled,
}: Readonly<DatePickerProps>) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const selected = parseIsoDate(value)
  const display = toDisplayDate(value)

  return (
    <GroovyPopover open={open} onOpenChange={setOpen} modal>
      <GroovyPopover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-md border border-border bg-surface-input px-3 text-sm outline-none transition-[color,box-shadow]',
            'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            display ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          <CalendarBlankIcon className="size-4 shrink-0 text-muted-foreground" />
          {display || placeholder}
        </button>
      </GroovyPopover.Trigger>

      <GroovyPopover.Content align="start" autoFocusContent subtle className="w-auto p-3">
        <DayPicker
          mode="single"
          locale={i18n.language === 'en' ? enUS : es}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return
            onChange(toIsoDate(date))
            setOpen(false)
          }}
          classNames={DAY_PICKER_CLASSNAMES}
          components={{
            Chevron: ({ orientation }) =>
              orientation === 'left' ? (
                <CaretLeftIcon className="size-4" />
              ) : (
                <CaretRightIcon className="size-4" />
              ),
          }}
        />
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
