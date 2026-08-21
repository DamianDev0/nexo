import 'server-only'

import { cookies } from 'next/headers'

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './locale'
import en from './locales/en'
import es from './locales/es'

type LocaleTree = Record<string, unknown>

const DICTIONARIES: Record<Locale, LocaleTree> = { es, en }

export async function getLocale(): Promise<Locale> {
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value
  return cookie && isLocale(cookie) ? cookie : DEFAULT_LOCALE
}

function resolve(tree: LocaleTree, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>((node, part) => (node as LocaleTree | undefined)?.[part as never], tree)
}

type Interpolations = Record<string, string | number>

function interpolate(template: string, values: Interpolations): string {
  return template.replaceAll(/\{\{(\w+)\}\}/g, (token, name: string) =>
    name in values ? String(values[name]) : token,
  )
}

export async function getT(): Promise<(key: string, values?: Interpolations) => string> {
  const locale = await getLocale()
  const dictionary = DICTIONARIES[locale]

  return (key, values) => {
    const value = resolve(dictionary, key) ?? resolve(DICTIONARIES[DEFAULT_LOCALE], key)
    if (typeof value !== 'string') return key
    return values ? interpolate(value, values) : value
  }
}
