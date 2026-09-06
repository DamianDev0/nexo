import type { CustomFieldEntity } from '@repo/shared-types'

const BOGOTA_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function defaultExportFileName(entity: CustomFieldEntity, now: Date = new Date()): string {
  return `${entity}-export-${BOGOTA_DATE.format(now)}`
}
