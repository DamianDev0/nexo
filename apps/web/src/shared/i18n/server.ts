import 'server-only'

import es from './locales/es'

type LocaleTree = Record<string, unknown>

export function t(key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as LocaleTree | undefined)?.[part as never], es)
  return typeof value === 'string' ? value : key
}
