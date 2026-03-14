import type { NITResult } from '@repo/shared-types'

// ─── NIT VALIDATION (DIAN módulo 11 algorithm) ──────────────────────
// NIT = 9 digits + 1 check digit (dígito de verificación)
// UI format: 900.123.456-7
// DB storage: nit="900123456", check_digit="7"

const NIT_WEIGHTS = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]

/**
 * Calculate the check digit (dígito de verificación) for a Colombian NIT.
 * Uses the DIAN módulo 11 algorithm.
 */
export function calculateCheckDigit(nit: string): string {
  const digits = nit.replace(/\D/g, '')

  const offset = NIT_WEIGHTS.length - digits.length
  let sum = 0

  for (let i = 0; i < digits.length; i++) {
    sum += Number.parseInt(digits[i]!, 10) * NIT_WEIGHTS[i + offset]!
  }

  const remainder = sum % 11

  if (remainder === 0) return '0'
  if (remainder === 1) return '1'
  return String(11 - remainder)
}

/**
 * Validate a Colombian NIT (with or without check digit).
 *
 * @example validateNIT("900123456-7") → { isValid: true, nit: "900123456", checkDigit: "7", formatted: "900.123.456-7" }
 * @example validateNIT("9001234567")  → { isValid: true, nit: "900123456", checkDigit: "7", formatted: "900.123.456-7" }
 * @example validateNIT("900123456")   → { isValid: true, nit: "900123456", checkDigit: "7", formatted: "900.123.456-7" }
 */
export function validateNIT(input: string): NITResult {
  const cleaned = input.replace(/[.\-\s]/g, '')

  if (!/^\d{9,10}$/.test(cleaned)) {
    return { isValid: false }
  }

  let nit: string
  let providedDV: string | undefined

  if (cleaned.length === 10) {
    nit = cleaned.slice(0, 9)
    providedDV = cleaned.slice(9)
  } else {
    nit = cleaned
  }

  const calculatedDV = calculateCheckDigit(nit)

  if (providedDV !== undefined && providedDV !== calculatedDV) {
    return { isValid: false }
  }

  return {
    isValid: true,
    nit,
    checkDigit: calculatedDV,
    formatted: formatNIT(nit, calculatedDV),
  }
}

/**
 * Format a NIT for display: 900.123.456-7
 */
export function formatNIT(nit: string, checkDigit: string): string {
  const digits = nit.replace(/\D/g, '')
  const parts: string[] = []

  for (let i = digits.length; i > 0; i -= 3) {
    parts.unshift(digits.slice(Math.max(0, i - 3), i))
  }

  return `${parts.join('.')}-${checkDigit}`
}

/**
 * Strip formatting from a NIT, returning only digits (no check digit).
 * @example stripNIT("900.123.456-7") → "900123456"
 */
export function stripNIT(input: string): string {
  const cleaned = input.replace(/[.\-\s]/g, '')
  return cleaned.length === 10 ? cleaned.slice(0, 9) : cleaned
}
