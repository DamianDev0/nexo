import { isValidCOPhone, phoneDigits } from '@repo/shared-utils'
import { z } from 'zod'

import type { FieldDef } from '@repo/shared-types'
import type { TFunction } from 'i18next'

const emailSchema = z.email()

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function customFieldError(def: FieldDef, value: unknown, t: TFunction): string | null {
  if (isEmpty(value)) {
    return def.required ? t('contacts.errors.customRequired', { label: def.label }) : null
  }

  if (def.type === 'phone' && !isValidCOPhone(phoneDigits(String(value)))) {
    return t('contacts.errors.phoneInvalid')
  }
  if (def.type === 'email' && !emailSchema.safeParse(String(value)).success) {
    return t('contacts.errors.emailInvalid')
  }
  if (def.type === 'url' && !isValidUrl(String(value))) {
    return t('contacts.errors.urlInvalid')
  }
  if ((def.type === 'number' || def.type === 'currency') && !Number.isFinite(Number(value))) {
    return t('contacts.errors.numberInvalid')
  }
  return null
}

export function validateCustomValues(
  defs: ReadonlyArray<FieldDef>,
  values: Readonly<Record<string, unknown>>,
  t: TFunction,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const def of defs) {
    const error = customFieldError(def, values[def.key], t)
    if (error) errors[def.key] = error
  }
  return errors
}
