// ─── COP CURRENCY UTILITIES ──────────────────────────────────────────
// All monetary values are stored as CENTAVOS (integer) in the database.
// $100.000 COP = 10_000_000 centavos in DB.

export const CENTAVOS_PER_PESO = 100

/**
 * Format centavos to Colombian Peso display string.
 * @example formatCOP(10_000_000) → "$100.000"
 * @example formatCOP(125_000_000) → "$1.250.000"
 * @example formatCOP(0) → "$0"
 */
export function formatCOP(centavos: number): string {
  const pesos = Math.round(centavos / CENTAVOS_PER_PESO)
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pesos)

  return `$${formatted}`
}

/**
 * Parse a COP formatted string back to centavos.
 * Handles: "$1.250.000", "1250000", "1.250.000"
 */
export function parseCOP(value: string): number {
  const cleaned = value.replace(/[$.\s]/g, '')
  const pesos = Number.parseInt(cleaned, 10)
  if (Number.isNaN(pesos)) return 0
  return pesos * CENTAVOS_PER_PESO
}

/**
 * Convert pesos to centavos for storage.
 * @example pesosToCentavos(100_000) → 10_000_000
 */
export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * CENTAVOS_PER_PESO)
}

/**
 * Convert centavos to pesos for display logic.
 * @example centavosToPesos(10_000_000) → 100_000
 */
export function centavosToPesos(centavos: number): number {
  return centavos / CENTAVOS_PER_PESO
}
