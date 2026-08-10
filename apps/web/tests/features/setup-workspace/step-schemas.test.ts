import { describe, expect, it } from 'vitest'

import {
  navigationStepSchema,
  nomenclatureStepSchema,
  pipelineStepSchema,
  themeStepSchema,
} from '@/features/setup-workspace/lib/step-schemas'

describe('pipelineStepSchema', () => {
  const VALID_STAGE = { name: 'MQL', color: '#a3e635', probability: 50 }

  it('accepts a pipeline with at least one well-formed stage', () => {
    const result = pipelineStepSchema.safeParse({ name: 'Sales', stages: [VALID_STAGE] })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ name: 'Sales', stages: [VALID_STAGE] })
  })

  it('rejects a stage missing required fields', () => {
    const result = pipelineStepSchema.safeParse({ name: 'Sales', stages: [{}] })
    expect(result.success).toBe(false)
  })

  it('rejects a stage with an out-of-range probability', () => {
    const result = pipelineStepSchema.safeParse({
      name: 'Sales',
      stages: [{ ...VALID_STAGE, probability: 150 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects a stage with an empty name or color', () => {
    expect(
      pipelineStepSchema.safeParse({ name: 'Sales', stages: [{ ...VALID_STAGE, name: '' }] })
        .success,
    ).toBe(false)
    expect(
      pipelineStepSchema.safeParse({ name: 'Sales', stages: [{ ...VALID_STAGE, color: '' }] })
        .success,
    ).toBe(false)
  })
})

describe('nomenclatureStepSchema', () => {
  const TERM = { singular: 'Contact', plural: 'Contacts' }

  it('accepts entity terms for all four entities', () => {
    const value = { contact: TERM, company: TERM, deal: TERM, activity: TERM }
    const result = nomenclatureStepSchema.safeParse(value)
    expect(result.success).toBe(true)
    expect(result.data).toEqual(value)
  })

  it('rejects when an entity is missing', () => {
    const result = nomenclatureStepSchema.safeParse({ contact: TERM, company: TERM, deal: TERM })
    expect(result.success).toBe(false)
  })

  it('rejects an entity term with an empty singular or plural', () => {
    const value = {
      contact: { singular: '', plural: 'Contacts' },
      company: TERM,
      deal: TERM,
      activity: TERM,
    }
    expect(nomenclatureStepSchema.safeParse(value).success).toBe(false)
  })
})

describe('navigationStepSchema', () => {
  const VALID_MODULE = {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    enabled: true,
    order: 1,
    customIconUrl: null,
    required: true,
  }

  it('accepts a navigation config with at least one module', () => {
    const result = navigationStepSchema.safeParse({ modules: [VALID_MODULE] })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ modules: [VALID_MODULE] })
  })

  it('rejects an empty module list', () => {
    expect(navigationStepSchema.safeParse({ modules: [] }).success).toBe(false)
  })

  it('rejects a module missing a required field', () => {
    const { key: _key, ...withoutKey } = VALID_MODULE
    expect(navigationStepSchema.safeParse({ modules: [withoutKey] }).success).toBe(false)
  })

  it('rejects a module order below 1', () => {
    expect(
      navigationStepSchema.safeParse({ modules: [{ ...VALID_MODULE, order: 0 }] }).success,
    ).toBe(false)
  })

  it('accepts a module order above 1', () => {
    expect(
      navigationStepSchema.safeParse({ modules: [{ ...VALID_MODULE, order: 5 }] }).success,
    ).toBe(true)
  })
})

describe('themeStepSchema', () => {
  const VALID_THEME = {
    colors: {
      primary: '#A5E96F',
      primaryForeground: '#0E0F0C',
      secondary: '#7FD6C2',
      accent: '#DFF3C6',
      sidebar: '#0E0F0C',
      sidebarForeground: '#F4F6F0',
    },
    typography: { fontFamily: 'inter', borderRadius: 'lg', density: 'comfortable' },
    branding: {
      logoUrl: null,
      faviconUrl: null,
      loginBgUrl: null,
      companyName: 'Acme',
      loginTagline: null,
    },
    iconPack: 'outline',
    darkModeDefault: 'system',
  } as const

  it('accepts a fully populated theme', () => {
    const result = themeStepSchema.safeParse(VALID_THEME)
    expect(result.success).toBe(true)
    expect(result.data).toEqual(VALID_THEME)
  })

  it('rejects an empty object', () => {
    expect(themeStepSchema.safeParse({}).success).toBe(false)
  })

  it('rejects when colors is not an object', () => {
    expect(themeStepSchema.safeParse({ ...VALID_THEME, colors: 'blue' }).success).toBe(false)
  })

  it('rejects when typography is not an object', () => {
    expect(themeStepSchema.safeParse({ ...VALID_THEME, typography: 'compact' }).success).toBe(false)
  })

  it('rejects when branding is not an object', () => {
    expect(themeStepSchema.safeParse({ ...VALID_THEME, branding: 'Acme' }).success).toBe(false)
  })

  it('rejects an empty branding company name', () => {
    expect(
      themeStepSchema.safeParse({
        ...VALID_THEME,
        branding: { ...VALID_THEME.branding, companyName: '' },
      }).success,
    ).toBe(false)
  })

  it.each(['inter', 'roboto', 'poppins', 'nunito', 'system'] as const)(
    'accepts fontFamily %s',
    (fontFamily) => {
      expect(
        themeStepSchema.safeParse({
          ...VALID_THEME,
          typography: { ...VALID_THEME.typography, fontFamily },
        }).success,
      ).toBe(true)
    },
  )

  it('rejects an unknown fontFamily', () => {
    expect(
      themeStepSchema.safeParse({
        ...VALID_THEME,
        typography: { ...VALID_THEME.typography, fontFamily: 'comic-sans' },
      }).success,
    ).toBe(false)
  })

  it.each(['none', 'sm', 'md', 'lg', 'full'] as const)(
    'accepts borderRadius %s',
    (borderRadius) => {
      expect(
        themeStepSchema.safeParse({
          ...VALID_THEME,
          typography: { ...VALID_THEME.typography, borderRadius },
        }).success,
      ).toBe(true)
    },
  )

  it('rejects an unknown borderRadius', () => {
    expect(
      themeStepSchema.safeParse({
        ...VALID_THEME,
        typography: { ...VALID_THEME.typography, borderRadius: 'huge' },
      }).success,
    ).toBe(false)
  })

  it.each(['compact', 'comfortable', 'spacious'] as const)('accepts density %s', (density) => {
    expect(
      themeStepSchema.safeParse({
        ...VALID_THEME,
        typography: { ...VALID_THEME.typography, density },
      }).success,
    ).toBe(true)
  })

  it('rejects an unknown density', () => {
    expect(
      themeStepSchema.safeParse({
        ...VALID_THEME,
        typography: { ...VALID_THEME.typography, density: 'roomy' },
      }).success,
    ).toBe(false)
  })

  it.each(['outline', 'filled', 'duotone', 'rounded'] as const)(
    'accepts iconPack %s',
    (iconPack) => {
      expect(themeStepSchema.safeParse({ ...VALID_THEME, iconPack }).success).toBe(true)
    },
  )

  it('rejects an unknown iconPack', () => {
    expect(themeStepSchema.safeParse({ ...VALID_THEME, iconPack: 'sketch' }).success).toBe(false)
  })

  it.each(['light', 'dark', 'system'] as const)('accepts darkModeDefault %s', (darkModeDefault) => {
    expect(themeStepSchema.safeParse({ ...VALID_THEME, darkModeDefault }).success).toBe(true)
  })

  it('rejects an unknown darkModeDefault', () => {
    expect(themeStepSchema.safeParse({ ...VALID_THEME, darkModeDefault: 'auto' }).success).toBe(
      false,
    )
  })
})
