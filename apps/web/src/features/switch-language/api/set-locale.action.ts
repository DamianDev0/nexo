'use server'

import { cookies } from 'next/headers'

import { LOCALE_COOKIE, isLocale } from '@/shared/i18n/locale'

const ONE_YEAR_SECONDS = 31_536_000

export async function setLocaleAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return

  const store = await cookies()
  store.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax',
  })
}
