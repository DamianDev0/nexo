import { DocumentType } from '@repo/shared-types'
import type { FieldDef } from '@repo/shared-types'
import { normalizeText, phoneDigits, validateDocumentNumber } from '@repo/shared-utils'
import { parseIntOrZero, splitList } from '@/shared/imports/constants/import.constants'
import type {
  ImportFieldDef,
  ImportFieldError,
  ImportRowMapper,
} from '@/shared/imports/interfaces/import.interfaces'

export const CUSTOM_FIELD_PREFIX = 'custom:'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_PHONE_DIGITS = 7
const MAX_LEAD_SCORE = 100

const CONTACT_FIELD_DEFS: ImportFieldDef[] = [
  {
    field: 'firstName',
    label: 'First name',
    required: true,
    aliases: ['nombre', 'nombres', 'first name', 'firstname', 'name', 'contacto'],
  },
  {
    field: 'lastName',
    label: 'Last name',
    required: false,
    aliases: ['apellido', 'apellidos', 'last name', 'lastname', 'surname'],
  },
  {
    field: 'email',
    label: 'Email',
    required: false,
    aliases: ['correo', 'correo electronico', 'e-mail', 'mail', 'email address'],
  },
  {
    field: 'phone',
    label: 'Phone',
    required: false,
    aliases: ['telefono', 'teléfono', 'celular', 'movil', 'móvil', 'tel', 'phone number', 'mobile'],
  },
  {
    field: 'whatsapp',
    label: 'WhatsApp',
    required: false,
    aliases: ['whats app', 'wa', 'whatsapp number'],
  },
  {
    field: 'documentType',
    label: 'Document type',
    required: false,
    aliases: ['tipo documento', 'tipo de documento', 'doc type', 'document type'],
  },
  {
    field: 'documentNumber',
    label: 'Document number',
    required: false,
    aliases: ['documento', 'cedula', 'cédula', 'nit', 'identificacion', 'cc', 'document'],
  },
  {
    field: 'jobTitle',
    label: 'Job title',
    required: false,
    aliases: ['cargo', 'puesto', 'position', 'title', 'job'],
  },
  {
    field: 'address',
    label: 'Address',
    required: false,
    aliases: ['direccion', 'dirección', 'domicilio'],
  },
  {
    field: 'city',
    label: 'City',
    required: false,
    aliases: ['ciudad', 'municipio', 'town'],
  },
  {
    field: 'department',
    label: 'Department',
    required: false,
    aliases: ['departamento', 'provincia', 'state', 'region'],
  },
  {
    field: 'status',
    label: 'Status',
    required: false,
    aliases: ['estado', 'etapa comercial', 'lead status'],
  },
  {
    field: 'source',
    label: 'Source',
    required: false,
    aliases: ['origen', 'fuente', 'canal', 'channel'],
  },
  {
    field: 'type',
    label: 'Type',
    required: false,
    aliases: ['tipo', 'tipo contacto', 'relacion'],
  },
  {
    field: 'lifecycleStage',
    label: 'Lifecycle stage',
    required: false,
    aliases: ['ciclo de vida', 'lifecycle', 'stage', 'etapa'],
  },
  {
    field: 'leadScore',
    label: 'Lead score',
    required: false,
    aliases: ['puntaje', 'score', 'calificacion', 'calificación'],
  },
  {
    field: 'tags',
    label: 'Tags (semicolon separated)',
    required: false,
    aliases: ['etiquetas', 'labels', 'tag'],
  },
]

function normalizeEnum(value: string): string {
  return normalizeText(value).replaceAll(/[\s-]+/g, '_')
}

export const contactImportMapper: ImportRowMapper = {
  fieldDefs: CONTACT_FIELD_DEFS,
  uniqueKeyField: 'email',

  normalizeValue(field: string, value: string): unknown {
    switch (field) {
      case 'email':
        return value.trim().toLowerCase()

      case 'phone':
      case 'whatsapp':
        return phoneDigits(value)

      case 'documentNumber':
        return value.replaceAll(/[.\-\s]/g, '')

      case 'documentType':
      case 'status':
      case 'source':
      case 'type':
      case 'lifecycleStage':
        return normalizeEnum(value)

      case 'leadScore':
        return parseIntOrZero(value)

      case 'tags':
        return splitList(value)

      default:
        return value.trim()
    }
  },

  validateField(field: string, value: unknown): ImportFieldError | null {
    if (typeof value === 'string' && value.length === 0) return null

    switch (field) {
      case 'email':
        if (typeof value === 'string' && !EMAIL_PATTERN.test(value)) {
          return { field, message: 'Invalid email address', value }
        }
        break

      case 'phone':
      case 'whatsapp':
        if (typeof value === 'string' && value.length < MIN_PHONE_DIGITS) {
          return { field, message: 'Phone number is too short', value }
        }
        break

      case 'documentType':
        if (typeof value === 'string' && !isDocumentType(value)) {
          return { field, message: 'Unknown document type', value }
        }
        break

      case 'leadScore':
        if (typeof value === 'number' && (value < 0 || value > MAX_LEAD_SCORE)) {
          return { field, message: 'Lead score must be between 0 and 100', value: String(value) }
        }
        break
    }

    return null
  },
}

export function isDocumentType(value: string): value is DocumentType {
  const known: readonly string[] = Object.values(DocumentType)
  return known.includes(value)
}

export function contactImportMapperFor(customFields: FieldDef[]): ImportRowMapper {
  const customDefs: ImportFieldDef[] = customFields.map((def) => ({
    field: `${CUSTOM_FIELD_PREFIX}${def.key}`,
    label: def.label,
    required: false,
    aliases: [def.label.toLowerCase(), def.key.replaceAll('_', ' ')],
  }))
  return { ...contactImportMapper, fieldDefs: [...CONTACT_FIELD_DEFS, ...customDefs] }
}

export function documentNumberError(
  documentType: string | null,
  documentNumber: string | null,
): string | null {
  if (!documentType || !documentNumber || !isDocumentType(documentType)) return null

  const result = validateDocumentNumber(documentType, documentNumber)
  return result.isValid ? null : (result.error ?? 'Invalid document number')
}
