import 'server-only'

import { cookies } from 'next/headers'

import { ApiError } from './api-error'
import { relaySetCookies } from './relay-cookies'

import type { ApiErrorResponse } from '@repo/shared-types'

const API_BASE = process.env.API_INTERNAL_URL
  ? `${process.env.API_INTERNAL_URL}/api/v1`
  : 'http://localhost:8080/api/v1'

const DEFAULT_REVALIDATE_SECONDS = 60

interface ApiFetchOptions<T> extends Omit<RequestInit, 'body'> {
  readonly tags?: string[]
  readonly revalidate?: number
  readonly parse?: (json: unknown) => T
  readonly body?: unknown
}

async function toApiError(res: Response): Promise<ApiError> {
  const fallback: ApiErrorResponse = {
    statusCode: res.status,
    message: res.statusText,
    error: res.statusText,
    timestamp: new Date().toISOString(),
    path: res.url,
    method: '',
  }
  const json = (await res.json().catch(() => null)) as ApiErrorResponse | null
  return new ApiError(json ?? fallback)
}

function mergeCookieHeader(cookieHeader: string, setCookies: ReadonlyArray<string>): string {
  const jar = new Map<string, string>()
  for (const pair of cookieHeader.split(';')) {
    const eq = pair.indexOf('=')
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim())
  }
  for (const header of setCookies) {
    const [pair] = header.split(';')
    const eq = pair?.indexOf('=') ?? -1
    if (pair && eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim())
  }
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
}

async function refreshServerSession(cookieHeader: string): Promise<string[] | null> {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: 'no-store',
  }).catch(() => null)
  if (!response?.ok) return null
  return response.headers.getSetCookie()
}

function doFetch<T>(
  endpoint: string,
  options: ApiFetchOptions<T>,
  cookieHeader: string,
): Promise<Response> {
  const { tags, revalidate, parse: _omitted, body, headers, ...rest } = options
  return fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(rest.cache === 'no-store'
      ? {}
      : { next: { tags, revalidate: revalidate ?? DEFAULT_REVALIDATE_SECONDS } }),
  })
}

async function requestApi<T>(
  endpoint: string,
  options: ApiFetchOptions<T>,
): Promise<{ data: T; response: Response }> {
  const cookieHeader = (await cookies()).toString()

  let response = await doFetch(endpoint, options, cookieHeader)

  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    const setCookies = await refreshServerSession(cookieHeader)
    if (setCookies && setCookies.length > 0) {
      await relaySetCookies(setCookies).catch(() => undefined)
      response = await doFetch(endpoint, options, mergeCookieHeader(cookieHeader, setCookies))
    }
  }

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return { data: undefined as T, response }

  const json: unknown = await response.json()
  const payload =
    json && typeof json === 'object' && 'data' in json ? (json as { data: unknown }).data : json
  return { data: (options.parse ? options.parse(payload) : payload) as T, response }
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions<T> = {}): Promise<T> {
  const { data } = await requestApi(endpoint, options)
  return data
}

export async function apiFetchWithCookies<T>(
  endpoint: string,
  options: ApiFetchOptions<T> = {},
): Promise<{ data: T; setCookies: string[] }> {
  const { data, response } = await requestApi(endpoint, { ...options, cache: 'no-store' })
  return { data, setCookies: response.headers.getSetCookie() }
}
