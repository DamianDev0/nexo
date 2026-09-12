export const MERIDIEMS = ['AM', 'PM'] as const

export const MINUTE_STEP = 5

export type Meridiem = (typeof MERIDIEMS)[number]

export type ClockParts = {
  readonly hour12: number
  readonly minute: number
  readonly meridiem: Meridiem
}

const PAD = 2

function pad(value: number): string {
  return String(value).padStart(PAD, '0')
}

export function parseClock(value: string): ClockParts {
  const [rawHours, rawMinutes] = value.split(':')
  const hours = Number(rawHours)
  const minute = Number(rawMinutes)
  const safeHours = Number.isFinite(hours) ? Math.min(Math.max(hours, 0), 23) : 0
  const safeMinute = Number.isFinite(minute) ? Math.min(Math.max(minute, 0), 59) : 0

  return {
    hour12: safeHours % 12 === 0 ? 12 : safeHours % 12,
    minute: safeMinute,
    meridiem: safeHours < 12 ? 'AM' : 'PM',
  }
}

export function toClock({ hour12, minute, meridiem }: ClockParts): string {
  const base = hour12 % 12
  const hours = meridiem === 'PM' ? base + 12 : base
  return `${pad(hours)}:${pad(minute)}`
}

export function formatClock(value: string): string {
  const { hour12, minute, meridiem } = parseClock(value)
  return `${pad(hour12)}:${pad(minute)} ${meridiem}`
}

export function hourOptions(): ReadonlyArray<number> {
  return Array.from({ length: 12 }, (_, index) => index + 1)
}

export function minuteOptions(step: number, current?: number): ReadonlyArray<number> {
  const safeStep = step > 0 && step <= 60 ? step : 1
  const stops = Array.from({ length: Math.ceil(60 / safeStep) }, (_, index) => index * safeStep)
  if (current === undefined || stops.includes(current)) return stops
  return [...stops, current].sort((a, b) => a - b)
}

export function clockLabel(value: number): string {
  return pad(value)
}
