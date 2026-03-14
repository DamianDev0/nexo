// ─── COLOMBIAN DATE UTILITIES ────────────────────────────────────────
// UI format: DD/MM/YYYY (never MM/DD/YYYY)
// API format: ISO 8601 with timezone
// Timezone: America/Bogota (UTC-5, no DST)

export const CO_TIMEZONE = 'America/Bogota'

/**
 * Format a date for Colombian UI display: DD/MM/YYYY
 * @example formatDateCO(new Date('2026-03-15')) → "15/03/2026"
 */
export function formatDateCO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: CO_TIMEZONE,
  }).format(d)
}

/**
 * Format a date with time for Colombian UI: DD/MM/YYYY HH:mm
 * @example formatDateTimeCO(new Date()) → "15/03/2026 10:30"
 */
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

/**
 * Parse a DD/MM/YYYY string to a Date object in Colombia timezone.
 * @example parseDateCO("15/03/2026") → Date
 */
export function parseDateCO(dateString: string): Date {
  const parts = dateString.split('/')
  if (parts.length !== 3) throw new Error(`Invalid date format: ${dateString}. Expected DD/MM/YYYY`)

  const [day, month, year] = parts
  return new Date(`${year}-${month}-${day}T00:00:00-05:00`)
}

/**
 * Get current date/time as ISO 8601 string in Colombia timezone.
 */
export function nowCO(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: CO_TIMEZONE }).replace(' ', 'T') + '-05:00'
}

/**
 * Format a date as relative time (e.g. "hace 2 horas", "hace 3 días").
 */
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
