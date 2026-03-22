import { z } from 'zod'

export const onboardingSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').min(2, 'At least 2 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .refine((v) => /^[a-z0-9-]+$/.test(v), 'Only lowercase letters, numbers, and hyphens'),
  planName: z.enum(['free', 'pro', 'team']),
  ownerFullName: z.string().min(1, 'Full name is required'),
  ownerEmail: z.string().min(1, 'Email is required').email('Enter a valid email'),
  ownerPassword: z.string().min(1, 'Password is required').min(8, 'At least 8 characters'),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
