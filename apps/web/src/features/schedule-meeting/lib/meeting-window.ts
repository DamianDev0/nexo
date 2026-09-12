import { MINUTES_IN_DAY } from '../config/meeting.constants'

export function clockToMinutes(clock: string): number {
  const [hours, minutes] = clock.split(':')
  return Number(hours) * 60 + Number(minutes)
}

export function meetingDuration(start: string, end: string): number {
  const span = clockToMinutes(end) - clockToMinutes(start)
  return span > 0 ? span : span + MINUTES_IN_DAY
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`
}

export function reminderIso(startIso: string, minutesBefore: number): string | undefined {
  if (minutesBefore <= 0) return undefined
  return new Date(new Date(startIso).getTime() - minutesBefore * 60_000).toISOString()
}
