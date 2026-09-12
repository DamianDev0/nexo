'use client'

import { useState } from 'react'

import { cn } from '@/shared/lib'
import { ClockIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'

import {
  clockLabel,
  formatClock,
  hourOptions,
  MERIDIEMS,
  MINUTE_STEP,
  minuteOptions,
  parseClock,
  toClock,
} from './clock'
import { TimeDrum } from './drum'

import type { ClockParts, Meridiem } from './clock'
import type { TimePickerLabels } from './labels'

type TimePickerProps = {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly labels: TimePickerLabels
  readonly disabled?: boolean
  readonly className?: string
}

export function TimePicker({
  value,
  onChange,
  labels,
  disabled,
  className,
}: Readonly<TimePickerProps>) {
  const [open, setOpen] = useState(false)
  const parts = parseClock(value)
  const commit = (next: Partial<ClockParts>) => onChange(toClock({ ...parts, ...next }))

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={labels.trigger}
          data-slot="time-picker-trigger"
          className={cn(
            'flex h-8 w-full min-w-0 items-center gap-2 rounded-md text-sm tabular-nums',
            'text-foreground transition-colors outline-none',
            'hover:text-primary-deep focus-visible:ring-2 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:text-disabled-fg',
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{formatClock(value)}</span>
          <ClockIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </GroovyPopover.Trigger>
      <GroovyPopover.Content autoFocusContent subtle className="p-2">
        <div className="relative flex items-stretch gap-1">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-muted"
          />
          <div className="relative flex items-stretch gap-1 [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]">
            <TimeDrum
              label={labels.hours}
              value={String(parts.hour12)}
              options={hourOptions().map((hour) => ({
                value: String(hour),
                label: clockLabel(hour),
              }))}
              onSelect={(next) => commit({ hour12: Number(next) })}
            />
            <TimeDrum
              label={labels.minutes}
              value={String(parts.minute)}
              options={minuteOptions(MINUTE_STEP, parts.minute).map((minute) => ({
                value: String(minute),
                label: clockLabel(minute),
              }))}
              onSelect={(next) => commit({ minute: Number(next) })}
            />
            <TimeDrum
              label={labels.meridiem}
              value={parts.meridiem}
              options={MERIDIEMS.map((meridiem) => ({ value: meridiem, label: meridiem }))}
              onSelect={(next) => commit({ meridiem: next as Meridiem })}
            />
          </div>
        </div>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}

export { formatClock, parseClock, toClock } from './clock'
export { buildTimePickerLabels } from './labels'
export type { TimePickerLabels } from './labels'
