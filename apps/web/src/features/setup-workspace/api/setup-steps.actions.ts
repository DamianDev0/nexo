'use server'

import { CO_TIMEZONE, CURRENCY_CODE } from '@repo/shared-utils'
import { updateTag } from 'next/cache'

import { toActionFailure } from '@/shared/api/action-result'
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
} from '../lib/step-schemas'

import type { ActionResult } from '@/shared/api/action-result'
import type { Pipeline } from '@repo/shared-types'

export type StepActionResult<T = null> = ActionResult<T>

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
    return toActionFailure(error)
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
    return toActionFailure(error)
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
    return toActionFailure(error)
  }
}

export async function saveNavigationAction(input: NavigationStepInput): Promise<StepActionResult> {
  try {
    const values = navigationStepSchema.parse(input)
    await apiFetch('/settings/navigation', { method: 'PATCH', cache: 'no-store', body: values })
    return { ok: true, data: null }
  } catch (error) {
    return toActionFailure(error)
  }
}

export async function saveThemeAction(input: ThemeStepInput): Promise<StepActionResult> {
  try {
    const values = themeStepSchema.parse(input)
    await apiFetch('/settings/theme', { method: 'PATCH', cache: 'no-store', body: values })
    updateTag(CACHE_TAGS.settingsTheme)
    return { ok: true, data: null }
  } catch (error) {
    return toActionFailure(error)
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
    return toActionFailure(error)
  }
}
