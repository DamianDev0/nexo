import type { Request, Response } from 'express'
import type { RequestMeta } from '../interfaces/auth-rows.interface'
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
} from '../constants/auth-cookies.constants'

export function extractMeta(req: Request): RequestMeta {
  const ip = String(req.ip ?? req.socket?.remoteAddress ?? 'unknown').replace('::ffff:', '')
  const header = req.headers['user-agent'] as string | string[] | undefined
  const userAgent = Array.isArray(header) ? (header[0] ?? 'unknown') : (header ?? 'unknown')
  return { ip, userAgent }
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  req: Request,
): void {
  const isProduction = (req.app.get('env') as string) === 'production'
  const base = { httpOnly: true, sameSite: 'strict' as const, secure: isProduction }

  res.cookie(ACCESS_COOKIE, accessToken, { ...base, maxAge: ACCESS_TOKEN_MAX_AGE_MS })
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...base,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: REFRESH_COOKIE_PATH,
  })
}

export function extractCookie(req: Request, name: string): string | undefined {
  const cookies = req.cookies as Record<string, string> | undefined
  return cookies?.[name]
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE)
  res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH })
}
