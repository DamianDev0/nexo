const DATE_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const DATETIME_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const RELATIVE_THRESHOLDS = [
  { max: 60, value: 1, unit: 'second' },
  { max: 3600, value: 60, unit: 'minute' },
  { max: 86400, value: 3600, unit: 'hour' },
  { max: 604800, value: 86400, unit: 'day' },
  { max: 2592000, value: 604800, unit: 'week' },
  { max: 31536000, value: 2592000, unit: 'month' },
] as const

export function formatDate(dateStr: string | Date): string {
  return DATE_FORMATTER.format(new Date(dateStr))
}

export function formatDateTime(dateStr: string | Date): string {
  return DATETIME_FORMATTER.format(new Date(dateStr))
}

export function fromNow(dateStr: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 5) return 'ahora'

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

  for (const { max, value, unit } of RELATIVE_THRESHOLDS) {
    if (Math.abs(seconds) < max) {
      return rtf.format(-Math.floor(seconds / value), unit as Intl.RelativeTimeFormatUnit)
    }
  }

  return rtf.format(-Math.floor(seconds / 31536000), 'year')
}
