export const CENTAVOS_PER_PESO = 100

export function formatCOP(centavos: number): string {
  const pesos = Math.round(centavos / CENTAVOS_PER_PESO)
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pesos)

  return `$${formatted}`
}

export function parseCOP(value: string): number {
  const cleaned = value.replace(/[$.\s]/g, '')
  const pesos = Number.parseInt(cleaned, 10)
  if (Number.isNaN(pesos)) return 0
  return pesos * CENTAVOS_PER_PESO
}

export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * CENTAVOS_PER_PESO)
}

export function centavosToPesos(centavos: number): number {
  return centavos / CENTAVOS_PER_PESO
}
