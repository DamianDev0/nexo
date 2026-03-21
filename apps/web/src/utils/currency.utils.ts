const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCOP(cents: number): string {
  return COP_FORMATTER.format(Math.round(cents) / 100)
}

export function parseCOPInput(input: string): number {
  const cleaned = input.replaceAll(/[$.\\s]/g, '')
  const pesos = Number.parseInt(cleaned, 10)
  if (Number.isNaN(pesos)) return 0
  return pesos * 100
}

export function centsToPesos(cents: number): number {
  return Math.round(cents) / 100
}

export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100)
}
