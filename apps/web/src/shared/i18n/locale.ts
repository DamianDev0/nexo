export const SUPPORTED_LOCALES = ['es', 'en'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'es'

export const LOCALE_COOKIE = 'NEXT_LOCALE'

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function negotiateLocale(acceptLanguage: string): Locale {
  const preferred = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0]?.trim().toLowerCase().slice(0, 2))

  for (const lang of preferred) {
    if (lang && isLocale(lang)) return lang
  }
  return DEFAULT_LOCALE
}
