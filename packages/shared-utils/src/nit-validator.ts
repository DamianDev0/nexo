import type { NITResult } from '@repo/shared-types'

const NIT_WEIGHTS = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]

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

export function formatNIT(nit: string, checkDigit: string): string {
  const digits = nit.replace(/\D/g, '')
  const parts: string[] = []

  for (let i = digits.length; i > 0; i -= 3) {
    parts.unshift(digits.slice(Math.max(0, i - 3), i))
  }

  return `${parts.join('.')}-${checkDigit}`
}

export function stripNIT(input: string): string {
  const cleaned = input.replace(/[.\-\s]/g, '')
  return cleaned.length === 10 ? cleaned.slice(0, 9) : cleaned
}
