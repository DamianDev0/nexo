import { DocumentType } from '@repo/shared-types'

import { validateNIT } from './nit-validator'

// ─── COLOMBIAN DOCUMENT VALIDATION ──────────────────────────────────

const DOCUMENT_RULES: Record<
  DocumentType,
  { pattern: RegExp; minLength: number; maxLength: number }
> = {
  [DocumentType.CC]: { pattern: /^\d+$/, minLength: 6, maxLength: 10 },
  [DocumentType.NIT]: { pattern: /^\d+$/, minLength: 9, maxLength: 10 },
  [DocumentType.CE]: { pattern: /^[a-zA-Z0-9]+$/, minLength: 4, maxLength: 12 },
  [DocumentType.PP]: { pattern: /^[a-zA-Z0-9]+$/, minLength: 4, maxLength: 20 },
  [DocumentType.TI]: { pattern: /^\d+$/, minLength: 8, maxLength: 10 },
  [DocumentType.PEP]: { pattern: /^\d+$/, minLength: 6, maxLength: 15 },
  [DocumentType.PPT]: { pattern: /^[a-zA-Z0-9]+$/, minLength: 6, maxLength: 15 },
}

/**
 * Validate a Colombian document number based on its type.
 */
export function validateDocumentNumber(
  type: DocumentType,
  number: string,
): { isValid: boolean; error?: string } {
  const cleaned = number.replace(/[.\-\s]/g, '')
  const rule = DOCUMENT_RULES[type]

  if (!rule.pattern.test(cleaned)) {
    return { isValid: false, error: `Invalid characters for ${type.toUpperCase()}` }
  }

  if (cleaned.length < rule.minLength || cleaned.length > rule.maxLength) {
    return {
      isValid: false,
      error: `${type.toUpperCase()} must be between ${rule.minLength} and ${rule.maxLength} characters`,
    }
  }

  // NIT has additional check digit validation
  if (type === DocumentType.NIT) {
    const result = validateNIT(cleaned)
    if (!result.isValid) {
      return { isValid: false, error: 'Invalid NIT check digit' }
    }
  }

  return { isValid: true }
}

/**
 * Format a document number for display based on type.
 * CC: 1.234.567.890
 * NIT: 900.123.456-7
 */
export function formatDocumentNumber(type: DocumentType, number: string): string {
  const cleaned = number.replace(/[.\-\s]/g, '')

  if (type === DocumentType.NIT) {
    const result = validateNIT(cleaned)
    return result.formatted ?? cleaned
  }

  if (type === DocumentType.CC || type === DocumentType.TI) {
    const parts: string[] = []
    for (let i = cleaned.length; i > 0; i -= 3) {
      parts.unshift(cleaned.slice(Math.max(0, i - 3), i))
    }
    return parts.join('.')
  }

  return cleaned
}

/**
 * Labels for each document type (Spanish).
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.CC]: 'Cédula de Ciudadanía',
  [DocumentType.NIT]: 'NIT',
  [DocumentType.CE]: 'Cédula de Extranjería',
  [DocumentType.PP]: 'Pasaporte',
  [DocumentType.TI]: 'Tarjeta de Identidad',
  [DocumentType.PEP]: 'Permiso Especial de Permanencia',
  [DocumentType.PPT]: 'Permiso de Protección Temporal',
}
