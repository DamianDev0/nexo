import { IndustrySector, UserRole } from '@repo/shared-types'
import { z } from 'zod'

export const generalStepSchema = z.object({
  phone: z.string(),
  website: z.string(),
  sector: z.nativeEnum(IndustrySector),
})

export const pipelineStepSchema = z.object({
  name: z.string().min(1),
  stages: z
    .array(
      z.object({
        name: z.string().min(1),
        color: z.string().min(1),
        probability: z.number().min(0).max(100),
      }),
    )
    .min(1),
})

const ENTITY_TERM_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} .&-]*$/u
const ENTITY_TERM_MAX = 24

const entityTerm = z
  .string()
  .trim()
  .min(2)
  .max(ENTITY_TERM_MAX)
  .regex(ENTITY_TERM_PATTERN)
  .transform((value) => value.charAt(0).toLocaleUpperCase() + value.slice(1))

const entityTermSchema = z.object({
  singular: entityTerm,
  plural: entityTerm,
})

export const nomenclatureStepSchema = z.object({
  contact: entityTermSchema,
  company: entityTermSchema,
  deal: entityTermSchema,
  activity: entityTermSchema,
})

export const navigationStepSchema = z.object({
  modules: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string(),
        icon: z.string(),
        enabled: z.boolean(),
        order: z.number().int().min(1),
        customIconUrl: z.string().nullable(),
        required: z.boolean(),
      }),
    )
    .min(1),
})

export const themeStepSchema = z.object({
  colors: z.object({
    primary: z.string(),
    primaryForeground: z.string(),
    secondary: z.string(),
    accent: z.string(),
    sidebar: z.string(),
    sidebarForeground: z.string(),
  }),
  typography: z.object({
    fontFamily: z.enum(['inter', 'roboto', 'poppins', 'nunito', 'system']),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
    density: z.enum(['compact', 'comfortable', 'spacious']),
  }),
  branding: z.object({
    logoUrl: z.string().nullable(),
    faviconUrl: z.string().nullable(),
    loginBgUrl: z.string().nullable(),
    companyName: z.string().min(1),
    loginTagline: z.string().nullable(),
  }),
  iconPack: z.enum(['outline', 'filled', 'duotone', 'rounded']),
  darkModeDefault: z.enum(['light', 'dark', 'system']),
})

export const invitesStepSchema = z
  .array(z.object({ email: z.string().email(), role: z.nativeEnum(UserRole) }))
  .max(20)

export type GeneralStepInput = z.infer<typeof generalStepSchema>
export type PipelineStepInput = z.infer<typeof pipelineStepSchema>
export type NomenclatureStepInput = z.infer<typeof nomenclatureStepSchema>
export type NavigationStepInput = z.infer<typeof navigationStepSchema>
export type ThemeStepInput = z.infer<typeof themeStepSchema>
export type InvitesStepInput = z.infer<typeof invitesStepSchema>
