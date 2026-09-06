import i18n, { createInstance, type i18n as I18nInstance } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, type Locale } from './locale'
import en from './locales/en'
import es from './locales/es'

const resources = {
  es: { translation: es },
  en: { translation: en },
} as const

const BASE_OPTIONS = {
  resources,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...SUPPORTED_LOCALES],
  nonExplicitSupportedLngs: true,
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
} as const

export function createLocaleInstance(locale: Locale): I18nInstance {
  const instance = createInstance({ ...BASE_OPTIONS, lng: locale, initImmediate: false })
  instance.use(initReactI18next)
  void instance.init()
  return instance
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ...BASE_OPTIONS,
    detection: {
      order: ['cookie'],
      caches: ['cookie'],
      lookupCookie: LOCALE_COOKIE,
      cookieMinutes: 525600,
    },
  })

export default i18n
