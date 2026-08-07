import type { MeResponse } from '@repo/shared-types'

export type SessionUser = Omit<MeResponse, 'onboardingCompleted'>
