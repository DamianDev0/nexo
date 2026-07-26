import { z } from 'zod'

import type { LoginRequest } from '@repo/shared-types'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
}) satisfies z.ZodType<LoginRequest>

export type LoginFormValues = z.infer<typeof loginSchema>
