'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'

import { cn } from '@/shared/lib'
import { smoothSpring, useReducedTransition } from '@/shared/lib/animations'
import { CaretLeftIcon, CaretRightIcon } from '@/shared/ui/icons'

import { CalendarZoom, yearPageStart } from './calendar-zoom'
import { buildMonthGrid, monthLabel, parseIsoDate, toIsoDate, weekdayLabels } from './date-iso'

type CalendarPanelProps = {
  readonly selected?: string
  readonly onSelect: (iso: string) => void
  readonly locale: string
}

type ZoomMode = 'days' | 'months' | 'years'

const NAV_BUTTON =
  'flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-120 hover:bg-muted hover:text-foreground'

export function CalendarPanel({ selected, onSelect, locale }: Readonly<CalendarPanelProps>) {
  const seed = parseIsoDate(selected) ?? new Date()
  const [view, setView] = useState({ year: seed.getFullYear(), month: seed.getMonth() })
  const [mode, setMode] = useState<ZoomMode>('days')
  const [pageStart, setPageStart] = useState(() => yearPageStart(seed.getFullYear()))
  const [direction, setDirection] = useState(0)
  const transition = useReducedTransition(smoothSpring)

  const shift = (delta: number) => {
    setDirection(delta)
    if (mode === 'days') {
      setView((current) => {
        const date = new Date(current.year, current.month + delta, 1)
        return { year: date.getFullYear(), month: date.getMonth() }
      })
      return
    }
    if (mode === 'months') {
      setView((current) => ({ ...current, year: current.year + delta }))
      return
    }
    setPageStart((current) => current + delta * 12)
  }

  const zoomOut = () => {
    setDirection(0)
    if (mode === 'days') setMode('months')
    if (mode === 'months') {
      setPageStart(yearPageStart(view.year))
      setMode('years')
    }
  }

  const pickZoom = (unit: number) => {
    setDirection(0)
    if (mode === 'years') {
      setView((current) => ({ ...current, year: unit }))
      setMode('months')
      return
    }
    setView((current) => ({ ...current, month: unit }))
    setMode('days')
  }

  const cells = useMemo(() => buildMonthGrid(view.year, view.month), [view])
  const weekdays = useMemo(() => weekdayLabels(locale), [locale])
  const todayIso = toIsoDate(new Date())
  const selectedParts = parseIsoDate(selected)
  const headerLabel =
    mode === 'days'
      ? monthLabel(view.year, view.month, locale)
      : mode === 'months'
        ? String(view.year)
        : `${pageStart}–${pageStart + 11}`
  const panelKey =
    mode === 'days' ? `days-${view.year}-${view.month}` : `${mode}-${view.year}-${pageStart}`

  return (
    <div className="w-64 select-none">
      <div className="flex h-9 items-center justify-between px-1">
        <button type="button" onClick={() => shift(-1)} className={NAV_BUTTON}>
          <CaretLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          disabled={mode === 'years'}
          className={cn(
            'rounded-md px-2 py-0.5 text-sm font-semibold text-foreground capitalize transition-colors duration-120',
            mode !== 'years' && 'hover:bg-muted',
          )}
        >
          {headerLabel}
        </button>
        <button type="button" onClick={() => shift(1)} className={NAV_BUTTON}>
          <CaretRightIcon className="size-4" />
        </button>
      </div>

      {mode === 'days' && (
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
      )}

      <div className="relative overflow-hidden px-1 pb-1">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={panelKey}
            initial={{ x: direction * 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -32, opacity: 0 }}
            transition={transition}
          >
            {mode === 'days' ? (
              <div className="grid grid-cols-7 gap-0.5">
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
              </div>
            ) : (
              <CalendarZoom
                view={{ mode, year: view.year, pageStart }}
                selected={{
                  year: selectedParts?.getFullYear() ?? view.year,
                  month: selectedParts?.getMonth() ?? view.month,
                }}
                locale={locale}
                onPick={pickZoom}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
