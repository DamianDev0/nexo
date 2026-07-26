'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n/locale'

import { setLocaleAction } from '../api/set-locale.action'

export function useSwitchLanguage() {
  const router = useRouter()
  const { i18n } = useTranslation()

  const resolved = i18n.resolvedLanguage ?? ''
  const current: Locale = isLocale(resolved) ? resolved : DEFAULT_LOCALE

  const switchTo = useCallback(
    async (locale: Locale) => {
      if (locale === current) return
      await setLocaleAction(locale)
      await i18n.changeLanguage(locale)
      router.refresh()
    },
    [current, i18n, router],
  )

  return { current, switchTo }
}
