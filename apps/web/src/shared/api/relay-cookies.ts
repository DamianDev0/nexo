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

function parseSetCookie(header: string): ParsedSetCookie | null {
  const [pair, ...attributes] = header.split(';')
  const eq = pair?.indexOf('=') ?? -1
  if (!pair || eq < 1) return null
  const name = pair.slice(0, eq).trim()
  const value = pair.slice(eq + 1).trim()

  const options: ParsedSetCookie['options'] = {}
  for (const attribute of attributes) {
    const [rawKey, rawValue] = attribute.split('=')
    const key = rawKey?.trim().toLowerCase()
    const attrValue = rawValue?.trim()
    if (key === 'httponly') options.httpOnly = true
    if (key === 'secure') options.secure = true
    if (key === 'path' && attrValue) options.path = attrValue
    if (key === 'max-age' && attrValue) options.maxAge = Number(attrValue)
    if (key === 'expires' && attrValue) options.expires = new Date(attrValue)
    if (key === 'samesite' && attrValue) {
      options.sameSite = attrValue.toLowerCase() as 'lax' | 'strict' | 'none'
    }
  }
  return { name, value, options }
}

export async function relaySetCookies(setCookieHeaders: ReadonlyArray<string>): Promise<void> {
  const store = await cookies()
  for (const header of setCookieHeaders) {
    const parsed = parseSetCookie(header)
    if (parsed) store.set(parsed.name, parsed.value, parsed.options)
  }
}
