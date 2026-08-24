import { ZodError } from 'zod'

import { ApiError } from '@/shared/api/api-error'

export type ActionFailure = { readonly ok: false; readonly error: string }

export type ActionResult<T = null> = { readonly ok: true; readonly data: T } | ActionFailure

export function toActionFailure(error: unknown): ActionFailure {
  if (error instanceof ApiError) return { ok: false, error: error.message }
  if (error instanceof ZodError) {
    const issues = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · ')
    return { ok: false, error: issues }
  }
  return { ok: false, error: error instanceof Error ? error.message : 'unknown' }
}
