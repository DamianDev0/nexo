import 'server-only'

import { cookies } from 'next/headers'

import { ApiError } from './api-error'

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

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions<T> = {}): Promise<T> {
  const { tags, revalidate, parse, body, headers, ...rest } = options
  const cookieHeader = (await cookies()).toString()

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    next: { tags, revalidate: revalidate ?? DEFAULT_REVALIDATE_SECONDS },
  })

  if (!res.ok) throw await toApiError(res)
  if (res.status === 204) return undefined as T

  const json: unknown = await res.json()
  const payload =
    json && typeof json === 'object' && 'data' in json ? (json as { data: unknown }).data : json
  return (parse ? parse(payload) : payload) as T
}
