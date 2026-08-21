import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES } from './locale'
import en from './locales/en'
import es from './locales/es'

const resources = {
  es: { translation: es },
  en: { translation: en },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    nonExplicitSupportedLngs: true,
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
    detection: {
      order: ['cookie'],
      caches: ['cookie'],
      lookupCookie: LOCALE_COOKIE,
      cookieMinutes: 525600,
    },
  })

export default i18n
