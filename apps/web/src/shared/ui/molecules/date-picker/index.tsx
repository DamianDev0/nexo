'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { CalendarBlankIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'

import { CalendarPanel } from './calendar-panel'
import { toDisplayDate } from './date-iso'

type DatePickerProps = {
  readonly value?: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly 'aria-label': string
  readonly className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
  className,
}: Readonly<DatePickerProps>) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const display = toDisplayDate(value)
  const locale = i18n.language === 'en' ? 'en-US' : 'es-CO'

  return (
    <GroovyPopover open={open} onOpenChange={setOpen} modal>
      <GroovyPopover.Trigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-md border border-border bg-surface-input px-3 text-sm outline-none transition-[color,box-shadow]',
            'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
            display ? 'text-foreground' : 'text-muted-foreground',
            className,
          )}
        >
          <CalendarBlankIcon className="size-4 shrink-0 text-muted-foreground" />
          {display || placeholder}
        </button>
      </GroovyPopover.Trigger>

      <GroovyPopover.Content align="start" autoFocusContent subtle className="w-auto p-2">
        <CalendarPanel
          selected={value}
          locale={locale}
          onSelect={(iso) => {
            onChange(iso)
            setOpen(false)
          }}
        />
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}

export { CalendarPanel } from './calendar-panel'
