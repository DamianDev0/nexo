'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'

import { cn } from '@/shared/lib'
import { smoothSpring, useReducedTransition } from '@/shared/lib/animations'
import { CaretLeftIcon, CaretRightIcon } from '@/shared/ui/icons'

import { buildMonthGrid, monthLabel, parseIsoDate, toIsoDate, weekdayLabels } from './date-iso'

type CalendarPanelProps = {
  readonly selected?: string
  readonly onSelect: (iso: string) => void
  readonly locale: string
}

const NAV_BUTTON =
  'flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-120 hover:bg-muted hover:text-foreground'

export function CalendarPanel({ selected, onSelect, locale }: Readonly<CalendarPanelProps>) {
  const seed = parseIsoDate(selected) ?? new Date()
  const [view, setView] = useState({ year: seed.getFullYear(), month: seed.getMonth() })
  const [direction, setDirection] = useState(0)
  const transition = useReducedTransition(smoothSpring)

  const shiftMonth = (delta: number) => {
    setDirection(delta)
    setView((current) => {
      const date = new Date(current.year, current.month + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  const cells = useMemo(() => buildMonthGrid(view.year, view.month), [view])
  const weekdays = useMemo(() => weekdayLabels(locale), [locale])
  const todayIso = toIsoDate(new Date())

  return (
    <div className="w-64 select-none">
      <div className="flex h-9 items-center justify-between px-1">
        <button type="button" onClick={() => shiftMonth(-1)} className={NAV_BUTTON}>
          <CaretLeftIcon className="size-4" />
        </button>
        <span className="text-sm font-semibold text-foreground capitalize">
          {monthLabel(view.year, view.month, locale)}
        </span>
        <button type="button" onClick={() => shiftMonth(1)} className={NAV_BUTTON}>
          <CaretRightIcon className="size-4" />
        </button>
      </div>

      <div className="mt-1 grid grid-cols-7 px-1">
        {weekdays.map((weekday) => (
          <span
            key={weekday}
            className="flex h-8 items-center justify-center text-[11px] font-semibold text-muted-foreground uppercase"
          >
            {weekday}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden px-1 pb-1">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={`${view.year}-${view.month}`}
            initial={{ x: direction * 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -32, opacity: 0 }}
            transition={transition}
            className="grid grid-cols-7 gap-0.5"
          >
            {cells.map((cell) => (
              <button
                key={cell.iso}
                type="button"
                onClick={() => onSelect(cell.iso)}
                className={cn(
                  'relative flex size-8 items-center justify-center rounded-md text-sm transition-colors duration-120',
                  cell.inMonth ? 'text-body' : 'text-faint',
                  cell.iso === selected
                    ? 'bg-primary font-bold text-primary-foreground'
                    : 'hover:bg-muted',
                  cell.iso === todayIso && cell.iso !== selected && 'font-semibold',
                )}
              >
                {cell.day}
                {cell.iso === todayIso && cell.iso !== selected && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
