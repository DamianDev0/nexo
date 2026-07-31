'use server'

import { apiFetchWithCookies } from '@/shared/api/client'
import { relaySetCookies } from '@/shared/api/relay-cookies'

import { onboardingSchema, type OnboardingFormValues } from '../lib/onboarding.schema'

import type { OnboardingResponse } from '@repo/shared-types'

export type RegisterWorkspaceResult =
  | { readonly ok: true; readonly tenant: { readonly slug: string; readonly name: string } }
  | { readonly ok: false; readonly error: string }

export async function registerWorkspaceAction(
  input: OnboardingFormValues,
): Promise<RegisterWorkspaceResult> {
  const values = onboardingSchema.parse(input)

  try {
    const { data, setCookies } = await apiFetchWithCookies<OnboardingResponse>('/auth/onboard', {
      method: 'POST',
      body: values,
    })
    await relaySetCookies(setCookies)
    return { ok: true, tenant: { slug: data.tenant.slug, name: data.tenant.name } }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'unknown' }
  }
}
