import { BadRequestException, Injectable } from '@nestjs/common'
import { activeFieldDefs } from '@repo/shared-types'
import { isValidCOPhone, phoneDigits } from '@repo/shared-utils'
import type { CustomFieldEntity, CustomFieldType, FieldDef } from '@repo/shared-types'
import { TenantConfigService } from './tenant-config.service'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function optionValues(def: FieldDef): Set<string> {
  return new Set((def.options ?? []).map((o) => o.value))
}

type FieldValidator = (def: FieldDef, value: unknown) => string | null

function validateNumber(def: FieldDef, value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return `"${def.label}" must be a number`
  if (def.min !== undefined && value < def.min) return `"${def.label}" must be ≥ ${def.min}`
  if (def.max !== undefined && value > def.max) return `"${def.label}" must be ≤ ${def.max}`
  return null
}

function validateCurrencyCents(def: FieldDef, value: unknown): string | null {
  const numberError = validateNumber(def, value)
  if (numberError) return numberError
  if (!Number.isInteger(value)) return `"${def.label}" must be integer cents (COP)`
  return null
}

function validateText(def: FieldDef, value: unknown): string | null {
  if (typeof value !== 'string') return `"${def.label}" must be text`
  if (def.min !== undefined && value.length < def.min) return `"${def.label}" is too short`
  if (def.max !== undefined && value.length > def.max) return `"${def.label}" is too long`
  return null
}

function validateBoolean(def: FieldDef, value: unknown): string | null {
  return typeof value === 'boolean' ? null : `"${def.label}" must be a boolean`
}

function validateSelect(def: FieldDef, value: unknown): string | null {
  return optionValues(def).has(value as string) ? null : `"${def.label}" has an invalid option`
}

function validateMultiselect(def: FieldDef, value: unknown): string | null {
  if (!Array.isArray(value)) return `"${def.label}" must be a list`
  const allowed = optionValues(def)
  return value.every((v) => allowed.has(v as string))
    ? null
    : `"${def.label}" has an invalid option`
}

function validateEmail(def: FieldDef, value: unknown): string | null {
  return typeof value === 'string' && EMAIL_PATTERN.test(value)
    ? null
    : `"${def.label}" must be a valid email`
}

function validateDate(def: FieldDef, value: unknown): string | null {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    ? null
    : `"${def.label}" must be a valid date`
}

function validatePhone(def: FieldDef, value: unknown): string | null {
  return typeof value === 'string' && isValidCOPhone(phoneDigits(value))
    ? null
    : `"${def.label}" must be a valid Colombian phone`
}

function validateUrl(def: FieldDef, value: unknown): string | null {
  if (typeof value !== 'string') return `"${def.label}" must be a valid URL`
  try {
    new URL(value)
    return null
  } catch {
    return `"${def.label}" must be a valid URL`
  }
}

function validateRelation(def: FieldDef, value: unknown): string | null {
  return typeof value === 'string' && UUID_PATTERN.test(value)
    ? null
    : `"${def.label}" must reference a valid ${def.relationEntity ?? 'record'} id`
}

function validateGeneric(def: FieldDef, value: unknown): string | null {
  return typeof value === 'string' || typeof value === 'object'
    ? null
    : `"${def.label}" has an invalid value`
}

const VALIDATORS: Partial<Record<CustomFieldType, FieldValidator>> = {
  number: validateNumber,
  currency: validateCurrencyCents,
  text: validateText,
  textarea: validateText,
  boolean: validateBoolean,
  select: validateSelect,
  multiselect: validateMultiselect,
  email: validateEmail,
  phone: validatePhone,
  url: validateUrl,
  date: validateDate,
  datetime: validateDate,
  relation: validateRelation,
}

function validateField(def: FieldDef, value: unknown): string | null {
  if (isEmpty(value)) {
    return def.required ? `"${def.label}" is required` : null
  }
  if (def.type === 'formula') {
    return `"${def.label}" is computed and cannot be set`
  }
  return (VALIDATORS[def.type] ?? validateGeneric)(def, value)
}

export type CustomFieldsValidationMode = 'create' | 'update'

export function validateCustomFields(
  values: Record<string, unknown>,
  defs: FieldDef[],
  mode: CustomFieldsValidationMode = 'create',
): void {
  const errors: string[] = []
  const byKey = new Map(defs.map((d) => [d.key, d]))

  for (const key of Object.keys(values)) {
    if (byKey.has(key)) continue
    if (mode === 'update' && values[key] === null) continue
    errors.push(`Unknown field "${key}"`)
  }

  const checkedDefs = mode === 'create' ? defs : defs.filter((def) => def.key in values)
  for (const def of checkedDefs) {
    const error = validateField(def, values[def.key])
    if (error) errors.push(error)
  }

  if (errors.length > 0) {
    throw new BadRequestException({ message: 'Custom field validation failed', errors })
  }
}

@Injectable()
export class CustomFieldsValidator {
  constructor(private readonly config: TenantConfigService) {}

  async validate(
    tenantId: string,
    entity: CustomFieldEntity,
    values: Record<string, unknown> | undefined,
    mode: CustomFieldsValidationMode = 'create',
  ): Promise<void> {
    if (mode === 'update' && values === undefined) return
    const defs = activeFieldDefs((await this.config.getCustomFields(tenantId))[entity])
    validateCustomFields(values ?? {}, defs, mode)
  }
}
