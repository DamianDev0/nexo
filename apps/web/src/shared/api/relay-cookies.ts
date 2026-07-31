import 'server-only'

import { cookies } from 'next/headers'

interface ParsedSetCookie {
  readonly name: string
  readonly value: string
  readonly options: {
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'lax' | 'strict' | 'none'
    path?: string
    maxAge?: number
    expires?: Date
  }
}

type CookieOptions = ParsedSetCookie['options']

const SAME_SITE_VALUES = new Set(['lax', 'strict', 'none'])

const ATTRIBUTE_PARSERS: Readonly<
  Record<string, (options: CookieOptions, value: string | undefined) => void>
> = {
  httponly: (options) => {
    options.httpOnly = true
  },
  secure: (options) => {
    options.secure = true
  },
  path: (options, value) => {
    if (value) options.path = value
  },
  'max-age': (options, value) => {
    const parsed = Number(value)
    if (value && Number.isFinite(parsed)) options.maxAge = parsed
  },
  expires: (options, value) => {
    const parsed = value ? new Date(value) : null
    if (parsed && !Number.isNaN(parsed.getTime())) options.expires = parsed
  },
  samesite: (options, value) => {
    const normalized = value?.toLowerCase()
    if (normalized && SAME_SITE_VALUES.has(normalized)) {
      options.sameSite = normalized as CookieOptions['sameSite']
    }
  },
}

function parseAttributes(attributes: ReadonlyArray<string>): CookieOptions {
  const options: CookieOptions = {}

  for (const attribute of attributes) {
    const [rawKey, rawValue] = attribute.split('=')
    const parser = ATTRIBUTE_PARSERS[rawKey?.trim().toLowerCase() ?? '']
    parser?.(options, rawValue?.trim())
  }

  return options
}

function parseSetCookie(header: string): ParsedSetCookie | null {
  const [pair, ...attributes] = header.split(';')
  const eq = pair?.indexOf('=') ?? -1
  if (!pair || eq < 1) return null

  return {
    name: pair.slice(0, eq).trim(),
    value: pair.slice(eq + 1).trim(),
    options: parseAttributes(attributes),
  }
}

export async function relaySetCookies(setCookieHeaders: ReadonlyArray<string>): Promise<void> {
  const store = await cookies()
  for (const header of setCookieHeaders) {
    const parsed = parseSetCookie(header)
    if (parsed) store.set(parsed.name, parsed.value, parsed.options)
  }
}
