import 'server-only'

import { cookies, headers } from 'next/headers'

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, negotiateLocale, type Locale } from './locale'
import en from './locales/en'
import es from './locales/es'

type LocaleTree = Record<string, unknown>

const DICTIONARIES: Record<Locale, LocaleTree> = { es, en }

export async function getLocale(): Promise<Locale> {
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value
  if (cookie && isLocale(cookie)) return cookie

  const acceptLanguage = (await headers()).get('accept-language')
  return acceptLanguage ? negotiateLocale(acceptLanguage) : DEFAULT_LOCALE
}

function resolve(tree: LocaleTree, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>((node, part) => (node as LocaleTree | undefined)?.[part as never], tree)
}

export async function getT(): Promise<(key: string) => string> {
  const locale = await getLocale()
  const dictionary = DICTIONARIES[locale]

  return (key) => {
    const value = resolve(dictionary, key) ?? resolve(DICTIONARIES[DEFAULT_LOCALE], key)
    return typeof value === 'string' ? value : key
  }
}
