const BOGOTA = 'America/Bogota'

const dayFormat = new Intl.DateTimeFormat('es-CO', {
  timeZone: BOGOTA,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const timeFormat = new Intl.DateTimeFormat('es-CO', {
  timeZone: BOGOTA,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatCallLogDate(atMs: number, nowMs: number): string {
  if (dayFormat.format(atMs) === dayFormat.format(nowMs)) return timeFormat.format(atMs)
  return dayFormat.format(atMs)
}
