export const CO_TIMEZONE = 'America/Bogota'

export function formatDateCO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: CO_TIMEZONE,
  }).format(d)
}

const SHORT_DATE_CO = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: CO_TIMEZONE,
})

export function formatDateShortCO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const parts = SHORT_DATE_CO.formatToParts(d)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? ''

  return `${part('day')} ${part('month').replace('.', '')} ${part('year')}`
}

export function formatDateTimeCO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: CO_TIMEZONE,
  }).format(d)
}

export function parseDateCO(dateString: string): Date {
  const parts = dateString.split('/')
  if (parts.length !== 3) throw new Error(`Invalid date format: ${dateString}. Expected DD/MM/YYYY`)

  const [day, month, year] = parts
  return new Date(`${year}-${month}-${day}T00:00:00-05:00`)
}

export function nowCO(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: CO_TIMEZONE }).replace(' ', 'T') + '-05:00'
}

export function timeAgoCO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHrs = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffSec < 60) return 'hace un momento'
  if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`
  if (diffHrs < 24) return `hace ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`
  if (diffDays < 30) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`

  return formatDateCO(d)
}
