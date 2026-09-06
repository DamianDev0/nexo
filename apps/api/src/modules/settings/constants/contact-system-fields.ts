import { IndustrySector } from '@repo/shared-types'
import type { FieldDef } from '@repo/shared-types'

export const CONTACT_SYSTEM_FIELD_KEYS = ['role', 'birth_date', 'address', 'social_url'] as const

export type ContactSystemFieldKey = (typeof CONTACT_SYSTEM_FIELD_KEYS)[number]

const SYSTEM_FIELD_ORDER_BASE = 1000

export const CONTACT_SYSTEM_FIELDS: ReadonlyArray<FieldDef> = [
  {
    key: 'role',
    label: 'Cargo',
    type: 'text',
    required: false,
    unique: false,
    order: SYSTEM_FIELD_ORDER_BASE + 1,
    isActive: true,
    isSystem: true,
    group: 'commercial',
    filterable: true,
  },
  {
    key: 'birth_date',
    label: 'Fecha de nacimiento',
    type: 'date',
    required: false,
    unique: false,
    order: SYSTEM_FIELD_ORDER_BASE + 2,
    isActive: true,
    isSystem: true,
    group: 'identity',
  },
  {
    key: 'address',
    label: 'Dirección',
    type: 'text',
    required: false,
    unique: false,
    order: SYSTEM_FIELD_ORDER_BASE + 3,
    isActive: true,
    isSystem: true,
    group: 'location',
  },
  {
    key: 'social_url',
    label: 'Perfil social',
    type: 'url',
    required: false,
    unique: false,
    order: SYSTEM_FIELD_ORDER_BASE + 4,
    isActive: false,
    isSystem: true,
    group: 'communication',
  },
]

const SOCIAL_URL_SECTORS: ReadonlySet<IndustrySector> = new Set([
  IndustrySector.TECNOLOGIA,
  IndustrySector.SERVICIOS,
])

const ROLE_LABEL_BY_SECTOR: Partial<Record<IndustrySector, string>> = {
  [IndustrySector.SALUD]: 'Parentesco / rol',
  [IndustrySector.EDUCACION]: 'Rol (acudiente, estudiante…)',
}

export function contactSystemFieldsFor(sector?: IndustrySector): FieldDef[] {
  return CONTACT_SYSTEM_FIELDS.map((field) => {
    if (field.key === 'social_url') {
      return { ...field, isActive: sector !== undefined && SOCIAL_URL_SECTORS.has(sector) }
    }
    if (field.key === 'role' && sector && ROLE_LABEL_BY_SECTOR[sector]) {
      return { ...field, label: ROLE_LABEL_BY_SECTOR[sector] }
    }
    return { ...field }
  })
}

export function withContactSystemFields(
  stored: ReadonlyArray<FieldDef>,
  sector?: IndustrySector,
): FieldDef[] {
  const byKey = new Map(stored.map((field) => [field.key, field]))
  const merged = contactSystemFieldsFor(sector).map((system) => {
    const existing = byKey.get(system.key)
    return existing ? { ...system, ...existing, type: system.type, isSystem: true } : system
  })
  const systemKeys = new Set(merged.map((field) => field.key))
  return [...stored.filter((field) => !systemKeys.has(field.key)), ...merged]
}

export function missingContactSystemFields(next: ReadonlyArray<FieldDef>): string[] {
  const keys = new Set(next.map((field) => field.key))
  return CONTACT_SYSTEM_FIELD_KEYS.filter((key) => !keys.has(key))
}

export function retypedContactSystemFields(next: ReadonlyArray<FieldDef>): string[] {
  const expected = new Map(CONTACT_SYSTEM_FIELDS.map((field) => [field.key, field.type]))
  return next
    .filter((field) => expected.has(field.key) && expected.get(field.key) !== field.type)
    .map((field) => field.key)
}
