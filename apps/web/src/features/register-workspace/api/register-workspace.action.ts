'use server'

import { toActionFailure } from '@/shared/api/action-result'
import { apiFetchWithCookies } from '@/shared/api/client'
import { relaySetCookies } from '@/shared/api/relay-cookies'

import { onboardingSchema, type OnboardingFormValues } from '../lib/onboarding.schema'

import type { ActionFailure } from '@/shared/api/action-result'
import type { OnboardingResponse } from '@repo/shared-types'

export type RegisterWorkspaceResult =
  | { readonly ok: true; readonly tenant: { readonly slug: string; readonly name: string } }
  | ActionFailure

export async function registerWorkspaceAction(
  input: OnboardingFormValues,
): Promise<RegisterWorkspaceResult> {
  try {
    const values = onboardingSchema.parse(input)
    const { data, setCookies } = await apiFetchWithCookies<OnboardingResponse>('/auth/onboard', {
      method: 'POST',
      body: values,
    })
    await relaySetCookies(setCookies)
    return { ok: true, tenant: { slug: data.tenant.slug, name: data.tenant.name } }
  } catch (error) {
    return toActionFailure(error)
  }
}
