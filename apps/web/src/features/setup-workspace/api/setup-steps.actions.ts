'use server'

import { CO_TIMEZONE, CURRENCY_CODE } from '@repo/shared-utils'
import { updateTag } from 'next/cache'
import { ZodError } from 'zod'

import { ApiError } from '@/shared/api/api-error'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { apiFetch } from '@/shared/api/client'

import {
  generalStepSchema,
  invitesStepSchema,
  navigationStepSchema,
  nomenclatureStepSchema,
  pipelineStepSchema,
  themeStepSchema,
  type GeneralStepInput,
  type InvitesStepInput,
  type NavigationStepInput,
  type NomenclatureStepInput,
  type PipelineStepInput,
  type ThemeStepInput,
} from '../model/step-schemas'

import type { Pipeline } from '@repo/shared-types'

export type StepActionResult<T = null> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string }

function toFailure(error: unknown): { ok: false; error: string } {
  if (error instanceof ApiError) return { ok: false, error: error.message }
  if (error instanceof ZodError) {
    const issues = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · ')
    return { ok: false, error: issues }
  }
  return { ok: false, error: error instanceof Error ? error.message : 'unknown' }
}

export async function saveGeneralAction(input: GeneralStepInput): Promise<StepActionResult> {
  try {
    const values = generalStepSchema.parse(input)
    await apiFetch('/settings/general', {
      method: 'PATCH',
      cache: 'no-store',
      body: {
        business: { phone: values.phone, website: values.website },
        i18n: { timezone: CO_TIMEZONE, currency: CURRENCY_CODE },
        industry: { sector: values.sector },
      },
    })
    updateTag(CACHE_TAGS.settingsGeneral)
    return { ok: true, data: null }
  } catch (error) {
    return toFailure(error)
  }
}

export async function createPipelineAction(
  input: PipelineStepInput,
): Promise<StepActionResult<Pipeline>> {
  try {
    const values = pipelineStepSchema.parse(input)
    const pipeline = await apiFetch<Pipeline>('/settings/pipelines', {
      method: 'POST',
      cache: 'no-store',
      body: { ...values, isDefault: true },
    })
    return { ok: true, data: pipeline }
  } catch (error) {
    return toFailure(error)
  }
}

export async function saveNomenclatureAction(
  input: NomenclatureStepInput,
): Promise<StepActionResult> {
  try {
    const values = nomenclatureStepSchema.parse(input)
    await apiFetch('/settings/nomenclature', { method: 'PATCH', cache: 'no-store', body: values })
    return { ok: true, data: null }
  } catch (error) {
    return toFailure(error)
  }
}

export async function saveNavigationAction(input: NavigationStepInput): Promise<StepActionResult> {
  try {
    const values = navigationStepSchema.parse(input)
    await apiFetch('/settings/navigation', { method: 'PATCH', cache: 'no-store', body: values })
    return { ok: true, data: null }
  } catch (error) {
    return toFailure(error)
  }
}

export async function saveThemeAction(input: ThemeStepInput): Promise<StepActionResult> {
  try {
    const values = themeStepSchema.parse(input)
    await apiFetch('/settings/theme', { method: 'PATCH', cache: 'no-store', body: values })
    updateTag(CACHE_TAGS.settingsTheme)
    return { ok: true, data: null }
  } catch (error) {
    return toFailure(error)
  }
}

export async function inviteUsersAction(
  input: InvitesStepInput,
): Promise<StepActionResult<number>> {
  try {
    const invites = invitesStepSchema.parse(input)
    await Promise.all(
      invites.map((invite) =>
        apiFetch('/users/invite', { method: 'POST', cache: 'no-store', body: invite }),
      ),
    )
    return { ok: true, data: invites.length }
  } catch (error) {
    return toFailure(error)
  }
}
