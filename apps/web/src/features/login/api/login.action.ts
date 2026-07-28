'use server'

import { ApiError } from '@/shared/api/api-error'
import { apiFetch, apiFetchWithCookies } from '@/shared/api/client'
import { relaySetCookies } from '@/shared/api/relay-cookies'

import { loginSchema, type LoginFormValues } from '../model/login.schema'

import type { LoginResponse } from '@repo/shared-types'

export type LoginActionResult =
  | { readonly ok: true; readonly slug: string }
  | {
      readonly ok: false
      readonly error: 'workspace_not_found' | 'invalid_credentials' | 'unknown'
    }

export async function loginAction(input: LoginFormValues): Promise<LoginActionResult> {
  const values = loginSchema.parse(input)

  let slug: string
  try {
    const tenant = await apiFetch<{ slug: string }>('/auth/resolve-tenant', {
      method: 'POST',
      body: { email: values.email },
      cache: 'no-store',
    })
    slug = tenant.slug
  } catch {
    return { ok: false, error: 'workspace_not_found' }
  }

  try {
    const { setCookies } = await apiFetchWithCookies<LoginResponse>('/auth/login', {
      method: 'POST',
      body: values,
      headers: { 'x-tenant-slug': slug },
    })
    await relaySetCookies(setCookies)
    return { ok: true, slug }
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      return { ok: false, error: 'invalid_credentials' }
    }
    return { ok: false, error: 'unknown' }
  }
}
