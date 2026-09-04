'use client'

import { cn } from '@/shared/lib'

const YEARS_PER_PAGE = 12

export function yearPageStart(year: number): number {
  return year - (year % YEARS_PER_PAGE)
}

export function monthNames(locale: string): ReadonlyArray<string> {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' })
  return Array.from({ length: 12 }, (_, month) => formatter.format(new Date(2024, month, 1)))
}

const ZOOM_CELL =
  'flex h-10 items-center justify-center rounded-md text-sm capitalize transition-colors duration-120'

type CalendarZoomView = {
  readonly mode: 'months' | 'years'
  readonly year: number
  readonly pageStart: number
}

type CalendarZoomProps = {
  readonly view: CalendarZoomView
  readonly selected: { readonly year: number; readonly month: number }
  readonly locale: string
  readonly onPick: (unit: number) => void
}

export function CalendarZoom({ view, selected, locale, onPick }: Readonly<CalendarZoomProps>) {
  if (view.mode === 'months') {
    return (
      <div className="grid grid-cols-3 gap-1 px-1 pb-1">
        {monthNames(locale).map((name, month) => (
          <button
            key={name}
            type="button"
            onClick={() => onPick(month)}
            className={cn(
              ZOOM_CELL,
              view.year === selected.year && month === selected.month
                ? 'bg-primary font-bold text-primary-foreground'
                : 'text-body hover:bg-muted',
            )}
          >
            {name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1 px-1 pb-1">
      {Array.from({ length: YEARS_PER_PAGE }, (_, index) => view.pageStart + index).map((year) => (
        <button
          key={year}
          type="button"
          onClick={() => onPick(year)}
          className={cn(
            ZOOM_CELL,
            'tabular-nums',
            year === selected.year
              ? 'bg-primary font-bold text-primary-foreground'
              : 'text-body hover:bg-muted',
          )}
        >
          {year}
        </button>
      ))}
    </div>
  )
}
