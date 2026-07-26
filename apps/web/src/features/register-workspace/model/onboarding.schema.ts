import { PlanName } from '@repo/shared-types'
import { PASSWORD_STRENGTH_REGEX, TENANT_SLUG_REGEX } from '@repo/shared-utils'
import { z } from 'zod'

import type { OnboardingRequest } from '@repo/shared-types'

export const onboardingSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').min(2, 'At least 2 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(TENANT_SLUG_REGEX, 'Only lowercase letters, numbers, and inner hyphens'),
  planName: z.enum(PlanName),
  ownerFullName: z.string().min(1, 'Full name is required'),
  ownerEmail: z.string().min(1, 'Email is required').email('Enter a valid email'),
  ownerPassword: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'At least 8 characters')
    .regex(PASSWORD_STRENGTH_REGEX, 'Include lowercase, uppercase, and a number'),
}) satisfies z.ZodType<OnboardingRequest & { planName: PlanName }>

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
