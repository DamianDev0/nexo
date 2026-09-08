const DATE_PART = /^\d{4}-\d{2}-\d{2}/

export function customFieldDatePart(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const match = DATE_PART.exec(raw)
  return match ? match[0] : null
}

export function nextCustomFieldDate(
  fieldType: string | undefined,
  raw: unknown,
  iso: string,
): string {
  if (fieldType === 'datetime' && typeof raw === 'string' && raw.includes('T')) {
    return `${iso}T${raw.slice(11, 16)}`
  }
  return iso
}

export function withCustomField(
  fields: Record<string, unknown> | undefined,
  key: string,
  value: unknown,
): Record<string, unknown> {
  return { ...fields, [key]: value }
}

export function parseCustomValue(raw: string, numeric: boolean): string | number | null {
  if (raw === '') return null
  if (!numeric) return raw
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}
