const DEFAULT_LOCALE = 'es-CO'

const GROUPED: Intl.NumberFormatOptions = {
  maximumFractionDigits: 0,
  useGrouping: 'always' as unknown as boolean,
}

export function formatNumber(value: number, locale: string = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, GROUPED).format(value)
}
