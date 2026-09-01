export type CalendarCell = {
  readonly iso: string
  readonly day: number
  readonly inMonth: boolean
}

export function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function toDisplayDate(value?: string): string {
  const date = parseIsoDate(value)
  if (!date) return ''
  return `${`${date.getDate()}`.padStart(2, '0')}/${`${date.getMonth() + 1}`.padStart(2, '0')}/${date.getFullYear()}`
}

export function buildMonthGrid(year: number, month: number): ReadonlyArray<CalendarCell> {
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const start = new Date(year, month, 1 - firstOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    return {
      iso: toIsoDate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    }
  })
}

export function monthLabel(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  )
}

export function weekdayLabels(locale: string): ReadonlyArray<string> {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2024, 0, index + 1)).slice(0, 2),
  )
}
