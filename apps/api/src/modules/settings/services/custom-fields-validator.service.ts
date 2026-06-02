import { BadRequestException, Injectable } from '@nestjs/common'
import type { CustomFieldEntity, FieldDef } from '@repo/shared-types'
import { TenantConfigService } from './tenant-config.service'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function optionValues(def: FieldDef): Set<string> {
  return new Set((def.options ?? []).map((o) => o.value))
}

function validateField(def: FieldDef, value: unknown): string | null {
  if (isEmpty(value)) {
    return def.required ? `"${def.label}" is required` : null
  }

  if (def.type === 'formula') {
    return `"${def.label}" is computed and cannot be set`
  }

  switch (def.type) {
    case 'number':
    case 'currency': {
      if (typeof value !== 'number' || !Number.isFinite(value))
        return `"${def.label}" must be a number`
      if (def.min !== undefined && value < def.min) return `"${def.label}" must be ≥ ${def.min}`
      if (def.max !== undefined && value > def.max) return `"${def.label}" must be ≤ ${def.max}`
      return null
    }
    case 'boolean':
      return typeof value === 'boolean' ? null : `"${def.label}" must be a boolean`
    case 'select':
      return optionValues(def).has(value as string) ? null : `"${def.label}" has an invalid option`
    case 'multiselect': {
      if (!Array.isArray(value)) return `"${def.label}" must be a list`
      const allowed = optionValues(def)
      return value.every((v) => allowed.has(v as string))
        ? null
        : `"${def.label}" has an invalid option`
    }
    case 'email':
      return typeof value === 'string' && EMAIL_PATTERN.test(value)
        ? null
        : `"${def.label}" must be a valid email`
    case 'date':
    case 'datetime':
      return typeof value === 'string' && !Number.isNaN(Date.parse(value))
        ? null
        : `"${def.label}" must be a valid date`
    case 'text':
    case 'textarea': {
      if (typeof value !== 'string') return `"${def.label}" must be text`
      if (def.min !== undefined && value.length < def.min) return `"${def.label}" is too short`
      if (def.max !== undefined && value.length > def.max) return `"${def.label}" is too long`
      return null
    }
    default:
      return typeof value === 'string' || typeof value === 'object'
        ? null
        : `"${def.label}" has an invalid value`
  }
}

export function validateCustomFields(values: Record<string, unknown>, defs: FieldDef[]): void {
  const errors: string[] = []
  const byKey = new Map(defs.map((d) => [d.key, d]))

  for (const key of Object.keys(values)) {
    if (!byKey.has(key)) errors.push(`Unknown field "${key}"`)
  }

  for (const def of defs) {
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
  ): Promise<void> {
    const defs = (await this.config.getCustomFields(tenantId))[entity]
    validateCustomFields(values ?? {}, defs)
  }
}
